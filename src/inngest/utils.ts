import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";
import { SANDBOX_TIMEOUT } from "./types";
import path from "path";

const ROOT_PATH = "/home/user";

const IGNORE_DIRS = new Set([".next", ".git", ".cache", "node_modules"]);

const TEXT_FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".html",
  ".css",
  ".scss",
  ".yml",
  ".yaml",
  ".toml",
  ".sh",
  ".bash",
  ".txt",
  ".svg",
  ".env",
  ".dockerfile",
  ".gitignore",
  ".npmrc",
  ".eslintrc",
  ".prettierrc",
]);

const BINARY_FILE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".woff",
  ".woff2",
  ".eot",
  ".ttf",
  ".otf",
  ".zip",
  ".gz",
  ".wasm",
]);

const isLikelyTextFile = (filePath: string, content: string): boolean => {
  const extension = path.extname(filePath).toLowerCase();
  if (BINARY_FILE_EXTENSIONS.has(extension)) return false;
  if (TEXT_FILE_EXTENSIONS.has(extension)) return true;
  return !content.includes("\u0000");
};

export async function getAllSandboxTextFiles(
  sandbox: Sandbox
): Promise<{ [path: string]: string }> {
  const findProcess = await sandbox.commands.run(`find ${ROOT_PATH} -type f`);
  const allPaths = findProcess.stdout.split("\n").filter(Boolean);

  const filteredPaths = allPaths.filter(
    (p) => !p.split("/").some((part) => IGNORE_DIRS.has(part))
  );

  const fileReadPromises = filteredPaths.map(async (fullPath) => {
    try {
      const content = await sandbox.files.read(fullPath);
      const relativePath = path.relative(ROOT_PATH, fullPath);
      return { path: relativePath, content };
    } catch (error) {
      console.warn(`Could not read file: ${fullPath}`, error);
      return null;
    }
  });

  const allFileData = await Promise.all(fileReadPromises);

  const textFiles: { [path: string]: string } = {};
  for (const file of allFileData) {
    if (file && isLikelyTextFile(file.path, file.content)) {
      textFiles[file.path] = file.content;
    }
  }

  return textFiles;
}

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(SANDBOX_TIMEOUT);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}

export const parseAgentOutput = (value: Message[]) => {
  const output = value[0];

  if (output.type !== "text") {
    return "Fragment";
  }

  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join("");
  } else {
    return output.content;
  }
};
