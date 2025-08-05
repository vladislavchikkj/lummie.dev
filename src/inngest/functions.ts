
import { Sandbox } from '@e2b/code-interpreter'
import { openai, createAgent } from '@inngest/agent-kit'

import { inngest } from './client'
import { getSandbox } from './utils'

export const helloWorld = inngest.createFunction(
	{ id: 'hello-world' },
	{ event: 'test/hello.world' },
	async ({ event, step }) => {
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("luci-ai-nextjs")
			return sandbox.sandboxId
		})

		const summarizer = createAgent({
			name: 'code-agent',
			system: 'You are an expert nextjs developer. You write readable, maintainable code. You write simple Next.js & React snippets.',
			model: openai({ model: 'gpt-4o' }),
		})

		const { output } = await summarizer.run(
			`Write the following snippet: ${event.data.value}`
		)

		const sandboxUrl = await step.run('get-sandbox-url', async () => {
			const sandbox = await getSandbox(sandboxId)
			const host = await sandbox.getHost(3000)
			return `https://${host}`
		})

		return { output, sandboxUrl }
	}
)
