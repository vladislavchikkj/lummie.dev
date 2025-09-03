import { Sandbox } from '@e2b/code-interpreter'
import { createNetwork, createState } from '@inngest/agent-kit'
import { inngest } from './client'
import { prisma } from '@/lib/db'
import { FileOperation, SANDBOX_TIMEOUT } from './types'
import { getAllSandboxTextFiles, getSandbox, parseAgentOutput } from './utils'
import {
  AgentState,
  createCodingAgent,
  fragmentTitleGenerator,
  responseGenerator,
} from './agents'
import {
  getPreviousMessages,
  saveErrorResult,
  saveSuccessResult,
  updateFragmentFilesInDb,
} from './data'

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/run' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('luci-ai-nextjs')
      await sandbox.setTimeout(SANDBOX_TIMEOUT)
      await prisma.project.update({
        where: { id: event.data.projectId },
        data: { sandboxId: sandbox.sandboxId },
      })
      return sandbox.sandboxId
    })

    const previousMessages = await step.run('get-previous-messages', () =>
      getPreviousMessages(event.data.projectId)
    )

    const state = createState<AgentState>(
      { summary: '', files: {} },
      { messages: previousMessages }
    )

    const codeAgent = createCodingAgent(sandboxId)

    const network = await createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        if (network.state.data.summary) return
        return codeAgent
      },
    })

    const result = await network.run(event.data.value, { state })

    const allSandboxFiles = await step.run(
      'list-all-sandbox-files',
      async () => {
        const sandbox = await getSandbox(sandboxId)
        return await getAllSandboxTextFiles(sandbox)
      }
    )

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    )
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    )

    const isError =
      !result.state.data.summary || Object.keys(allSandboxFiles).length === 0

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = await sandbox.getHost(3000)
      return `https://${host}`
    })

    await step.run('save-result', async () => {
      if (isError) {
        return await saveErrorResult(event.data.projectId)
      }
      return await saveSuccessResult({
        projectId: event.data.projectId,
        newProjectName: parseAgentOutput(fragmentTitleOutput),
        responseText: parseAgentOutput(responseOutput),
        sandboxUrl: sandboxUrl,
        allSandboxFiles: allSandboxFiles,
      })
    })

    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: allSandboxFiles,
      summary: result.state.data.summary,
    }
  }
)

export const updateProjectFunction = inngest.createFunction(
  { id: 'code-agent-update', concurrency: 1 },
  { event: 'code-agent/update' },
  async ({ event, step }) => {
    const { projectId, filesToUpdate } = event.data

    const project = await step.run('get-project-sandbox-id', async () => {
      return await prisma.project.findUnique({
        where: { id: projectId },
        select: { sandboxId: true },
      })
    })

    if (!project?.sandboxId) {
      throw new Error(`Sandbox ID not found for project ${projectId}`)
    }

    const { sandboxId } = project

    await step.run('update-files-in-sandbox', async () => {
      const sandbox = await getSandbox(sandboxId)
      for (const file of filesToUpdate) {
        await sandbox.files.write(file.path, file.content)
      }
    })

    const allSandboxFiles = await step.run(
      'list-all-updated-sandbox-files',
      async () => {
        const sandbox = await getSandbox(sandboxId)
        return await getAllSandboxTextFiles(sandbox)
      }
    )

    await step.run('update-fragment-in-db', async () => {
      await updateFragmentFilesInDb(projectId, allSandboxFiles)
    })

    await step.run('update-project-status', async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' },
      })
    })

    return { success: true, message: `Project ${projectId} updated.` }
  }
)

export const manageProjectFilesFunction = inngest.createFunction(
  { id: 'code-agent-manage-files', concurrency: 1 },
  { event: 'code-agent/manage-files' },
  async ({ event, step }) => {
    const { projectId, operations } = event.data as {
      projectId: string
      operations: FileOperation[]
    }

    const project = await step.run('get-project-sandbox-id', async () => {
      return await prisma.project.findUnique({
        where: { id: projectId },
        select: { sandboxId: true },
      })
    })

    if (!project?.sandboxId) {
      throw new Error(`Sandbox ID not found for project ${projectId}`)
    }

    const { sandboxId } = project

    await step.run('execute-file-operations', async () => {
      const sandbox = await getSandbox(sandboxId)
      for (const op of operations) {
        switch (op.type) {
          case 'create':
            if (op.itemType === 'file') {
              await sandbox.files.write(op.path, '')
            } else {
              await sandbox.commands.run(`mkdir -p ${op.path}`)
            }
            break
          case 'delete':
            await sandbox.commands.run(`rm -rf ${op.path}`)
            break
          case 'rename':
            await sandbox.files.rename(op.oldPath, op.newPath)
            break
        }
      }
    })

    const allSandboxFiles = await step.run(
      'list-all-updated-sandbox-files',
      async () => {
        const sandbox = await getSandbox(sandboxId)
        return await getAllSandboxTextFiles(sandbox)
      }
    )

    await step.run('update-fragment-in-db-after-management', async () => {
      await updateFragmentFilesInDb(projectId, allSandboxFiles)
    })

    await step.run('touch-project-updated-at', async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
      })
    })

    return {
      success: true,
      message: `File operations for project ${projectId} completed.`,
    }
  }
)
