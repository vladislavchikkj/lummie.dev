import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  type Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";

import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { inngest } from "./client";
import {
  getAllSandboxTextFiles,
  getSandbox,
  lastAssistantTextMessageContent,
  parseAgentOutput,
} from "./utils";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("luci-ai-nextjs");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);

      await prisma.project.update({
        where: { id: event.data.projectId },
        data: { sandboxId: sandbox.sandboxId },
      });

      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }

        return formattedMessages.reverse();
      }
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "An expert coding agent",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const context = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  context.push({ path: file, content });
                }
                return JSON.stringify(context);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = await createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const allSandboxFiles = await step.run(
      "list-all-sandbox-files",
      async () => {
        const sandbox = await getSandbox(sandboxId);
        return await getAllSandboxTextFiles(sandbox);
      }
    );
    const fragmentTitleGenetator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenetator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const isError =
      !result.state.data.summary || Object.keys(allSandboxFiles).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        await prisma.project.update({
          where: { id: event.data.projectId },
          data: { status: "ERROR" },
        });

        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      const newProjectName = parseAgentOutput(fragmentTitleOutput);

      return await prisma.$transaction([
        prisma.project.update({
          where: {
            id: event.data.projectId,
          },
          data: {
            name: newProjectName,
            status: "COMPLETED",
          },
        }),
        prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: parseAgentOutput(responseOutput),
            role: "ASSISTANT",
            type: "RESULT",
            fragment: {
              create: {
                sandboxUrl: sandboxUrl,
                title: newProjectName,
                files: allSandboxFiles,
              },
            },
          },
        }),
      ]);
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: allSandboxFiles,
      summary: result.state.data.summary,
    };
  }
);

export const updateProjectFunction = inngest.createFunction(
  { id: "code-agent-update", concurrency: 1 }, // Добавим concurrency для отладки
  { event: "code-agent/update" },
  async ({ event, step }) => {
    console.log(
      `[START] Function 'code-agent-update' started for project ${event.data.projectId}`
    );
    const { projectId, filesToUpdate } = event.data;

    // Шаг 1: Получаем sandboxId из базы данных
    const project = await step.run("get-project-sandbox-id", async () => {
      console.log(`[STEP 1] Getting sandboxId for project ${projectId}`);
      const result = await prisma.project.findUnique({
        where: { id: projectId },
        select: { sandboxId: true },
      });
      console.log(`[STEP 1] Found sandboxId: ${result?.sandboxId}`);
      return result;
    });

    if (!project?.sandboxId) {
      console.error(`[ERROR] Project ${projectId} does not have a sandboxId.`);
      throw new Error(`Sandbox ID not found for project ${projectId}`);
    }

    const { sandboxId } = project;
    console.log(`Successfully retrieved sandboxId: ${sandboxId}`);

    // Шаг 2: Подключаемся к существующему sandbox и обновляем файлы
    await step.run("update-files-in-sandbox", async () => {
      try {
        console.log(`[STEP 2] Trying to get sandbox with ID: ${sandboxId}`);
        const sandbox = await getSandbox(sandboxId); // <--- СКОРЕЕ ВСЕГО, ЗАВИСАЕТ ЗДЕСЬ
        console.log(
          `[STEP 2] Successfully connected to sandbox. Writing files...`
        );

        for (const file of filesToUpdate) {
          await sandbox.files.write(file.path, file.content);
          console.log(`[STEP 2] Wrote file: ${file.path}`);
        }
        console.log("[STEP 2] Finished writing files.");
      } catch (error) {
        console.error(
          "[CRITICAL] Failed inside 'update-files-in-sandbox' step!",
          error
        );
        throw error; // Обязательно пробрасываем ошибку дальше
      }
    });

    console.log("Files updated in sandbox. Now listing all files.");

    // Шаг 3: Получаем обновленное дерево файлов из sandbox
    const allSandboxFiles = await step.run(
      "list-all-updated-sandbox-files",
      async () => {
        console.log("[STEP 3] Listing all sandbox files.");
        const sandbox = await getSandbox(sandboxId);
        const files = await getAllSandboxTextFiles(sandbox);
        console.log("[STEP 3] Successfully listed all files.");
        return files;
      }
    );

    // Шаг 4: Обновляем файлы в последнем сообщении (Fragment) в базе данных
    await step.run("update-fragment-in-db", async () => {
      const latestMessageWithFragment = await prisma.message.findFirst({
        where: {
          projectId: projectId,
          fragment: {
            isNot: null,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          fragment: {
            select: {
              id: true,
            },
          },
        },
      });

      if (latestMessageWithFragment?.fragment?.id) {
        await prisma.fragment.update({
          where: {
            id: latestMessageWithFragment.fragment.id,
          },
          data: {
            files: allSandboxFiles,
          },
        });
      } else {
        console.warn(`No fragment found to update for project ${projectId}`);
      }
    });

    // Шаг 5 (опционально): Обновляем статус проекта
    await step.run("update-project-status", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "COMPLETED" },
      });
    });

    console.log("[END] Function finished successfully.");
    return { success: true, message: `Project ${projectId} updated.` };
  }
);
