import {
  createAgent,
  createTool,
  openai,
  type Tool,
  type AgentResult,
} from '@inngest/agent-kit'
import z from 'zod'
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@/prompt'
import { getSandbox, lastAssistantTextMessageContent } from './utils'

export interface AgentState {
  summary: string
  files: { [path: string]: string }
}

export const createCodingAgent = (sandboxId: string) =>
  createAgent<AgentState>({
    name: 'code-agent',
    system: PROMPT,
    model: openai({
      model: 'gpt-4.1',
      defaultParameters: {
        temperature: 0.1,
      },
    }),
    tools: [
      createTool({
        name: 'terminal',
        description: 'An expert coding agent',
        parameters: z.object({
          command: z.string(),
        }),
        handler: async ({ command }, { step }) => {
          return await step?.run('terminal', async () => {
            const buffers = { stdout: '', stderr: '' }
            try {
              const sandbox = await getSandbox(sandboxId)
              const result = await sandbox.commands.run(command, {
                onStdout: (data: string) => {
                  buffers.stdout += data
                },
                onStderr: (data: string) => {
                  buffers.stderr += data
                },
              })
              return result.stdout
            } catch (e) {
              console.error(
                `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
              )
              return `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
            }
          })
        },
      }),
      createTool({
        name: 'createOrUpdateFiles',
        description: 'Create or update files in the sandbox',
        parameters: z.object({
          files: z.array(
            z.object({
              path: z.string(),
              content: z.string(),
            })
          ),
        }),
        handler: async ({ files }, options: Tool.Options<AgentState>) => {
          const newFiles = await options.step?.run(
            'createOrUpdateFiles',
            async () => {
              try {
                const updatedFiles = options.network.state.data.files || {}
                const sandbox = await getSandbox(sandboxId)
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content)
                  updatedFiles[file.path] = file.content
                }
                return updatedFiles
              } catch (e) {
                return 'Error: ' + e
              }
            }
          )
          if (typeof newFiles === 'object') {
            options.network.state.data.files = newFiles
          }
        },
      }),
      createTool({
        name: 'readFiles',
        description: 'Read files from the sandbox',
        parameters: z.object({
          files: z.array(z.string()),
        }),
        handler: async ({ files }, { step }) => {
          return await step?.run('readFiles', async () => {
            try {
              const sandbox = await getSandbox(sandboxId)
              const context = []
              for (const file of files) {
                const content = await sandbox.files.read(file)
                context.push({ path: file, content })
              }
              return JSON.stringify(context)
            } catch (e) {
              return 'Error: ' + e
            }
          })
        },
      }),
    ],
    lifecycle: {
      onResponse: async (args) => {
        const { result, network } = args

        if (network) {
          const lastMessage = lastAssistantTextMessageContent(result)
          if (lastMessage?.includes('<task_summary>')) {
            network.state.data.summary = lastMessage
          }
        }
        return result as AgentResult
      },
    },
  })

export const fragmentTitleGenerator = createAgent({
  name: 'fragment-title-generator',
  description: 'A fragment title generator',
  system: FRAGMENT_TITLE_PROMPT,
  model: openai({
    model: 'gpt-4o',
  }),
})

export const responseGenerator = createAgent({
  name: 'response-generator',
  description: 'A response generator',
  system: RESPONSE_PROMPT,
  model: openai({
    model: 'gpt-4o',
  }),
})
