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
import type { ReasoningEvent } from './types'

export interface AgentState {
  summary: string
  files: { [path: string]: string }
  reasoningSteps: ReasoningEvent[]
  publishEvent?: (event: ReasoningEvent) => Promise<void>
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
        handler: async ({ command }, options: Tool.Options<AgentState>) => {
          const publishEvent = options.network.state.data.publishEvent

          if (publishEvent) {
            const isInstall =
              command.includes('npm install') || command.includes('npm i')
            const isBuild =
              command.includes('npm run build') || command.includes('build')

            if (isInstall || isBuild) {
              const actionStart = Date.now()
              const title = isInstall
                ? 'Installing dependencies'
                : 'Building project'
              const description = command

              await publishEvent({
                type: 'action',
                phase: 'started',
                title,
                description,
                timestamp: actionStart,
                metadata: { command },
              })
            }
          }

          const startTime = Date.now()
          const result = await options.step?.run('terminal', async () => {
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

          if (publishEvent) {
            const isInstall =
              command.includes('npm install') || command.includes('npm i')
            const isBuild =
              command.includes('npm run build') || command.includes('build')

            if (isInstall || isBuild) {
              const title = isInstall
                ? 'Installed dependencies'
                : 'Built project'

              await publishEvent({
                type: 'action',
                phase: 'completed',
                title,
                description: command,
                timestamp: Date.now(),
                duration: (Date.now() - startTime) / 1000,
                metadata: { command },
              })
            }
          }

          return result
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
          const publishEvent = options.network.state.data.publishEvent
          const operationId = `files-${Date.now()}-${files.map((f) => f.path).join('-')}`

          if (publishEvent) {
            const filesList = files.map((f) => f.path).join(', ')
            const actionStart = Date.now()
            await publishEvent({
              type: 'action',
              phase: 'started',
              title: `Creating ${files.length} file${files.length > 1 ? 's' : ''}`,
              description: `Writing: ${filesList}`,
              timestamp: actionStart,
              metadata: {
                files: files.map((f) => f.path),
                operationId,
              },
            })
          }

          const startTime = Date.now()
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

            if (publishEvent) {
              const filesList = files.map((f) => f.path).join(', ')
              await publishEvent({
                type: 'action',
                phase: 'completed',
                title: `Created ${files.length} file${files.length > 1 ? 's' : ''}`,
                description: `Successfully wrote: ${filesList}`,
                timestamp: Date.now(),
                duration: (Date.now() - startTime) / 1000,
                metadata: {
                  files: files.map((f) => f.path),
                  operationId,
                },
              })
            }
          }
        },
      }),
      createTool({
        name: 'readFiles',
        description: 'Read files from the sandbox',
        parameters: z.object({
          files: z.array(z.string()),
        }),
        handler: async ({ files }, options: Tool.Options<AgentState>) => {
          const publishEvent = options.network.state.data.publishEvent

          if (publishEvent && files.length > 0) {
            const filesList = files.join(', ')
            await publishEvent({
              type: 'action',
              phase: 'completed',
              title: `Read ${files.length} file${files.length > 1 ? 's' : ''}`,
              description: `Analyzed: ${filesList}`,
              timestamp: Date.now(),
              metadata: { files },
            })
          }

          return await options.step?.run('readFiles', async () => {
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

export const reasoningGenerator = createAgent({
  name: 'reasoning-generator',
  description: 'Generates detailed reasoning about the current task',
  system: `You are an expert AI developer thinking through coding tasks step-by-step, like OpenAI's o1 model.

When given a user request, think out loud in first person about:
1. Understanding: What does the user really want? What's the core problem or goal?
2. Approach: What's the best way to solve this? What architecture or patterns fit?
3. Planning: What files, components, or structure will I need?
4. Considerations: What edge cases, challenges, or decisions should I think about?

Write 3-5 sentences of clear, strategic thinking. Be specific about technical choices.
Think like a senior developer planning the project architecture.

Example style:
"I'm analyzing this request for a landing page. The user wants something modern and responsive, so I'm thinking Next.js with Tailwind for styling. I'll need to create a main page component with hero section, features, and CTA. The key challenge will be making it look professional without overcomplicating the structure. I'll start with a clean layout and add interactive elements progressively."`,
  model: openai({
    model: 'gpt-4o-mini',
    defaultParameters: {
      temperature: 0.8,
    },
  }),
})
