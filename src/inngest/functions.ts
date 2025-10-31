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
import { projectChannel } from '@/inngest/channels'

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/run' },
  async ({ event, step, publish }) => {

    await publish(projectChannel(event.data.projectId).status({
      functionId: 'code-agent',
      phase: 'started',
      message: 'start creating project'
    }))

    const projectStatus = await step.run('check-project-status', async () => {
      const project = await prisma.project.findUnique({
        where: { id: event.data.projectId },
        select: { status: true, sandboxId: true },
      })

      // Если проект уже завершен или в процессе, не запускаем генерацию
      if (project?.status === 'COMPLETED') {
        console.log(
          `Project ${event.data.projectId} is already completed, skipping generation`
        )
        return { shouldSkip: true, status: project.status }
      }

      // Если проект уже в процессе генерации и есть sandboxId, не создаем новый
      if (project?.status === 'PENDING' && project.sandboxId) {
        console.log(
          `Project ${event.data.projectId} is already in progress with sandbox ${project.sandboxId}, skipping generation`
        )
        return {
          shouldSkip: true,
          status: project.status,
          sandboxId: project.sandboxId,
        }
      }

      return { shouldSkip: false, status: project?.status }
    })

    if (projectStatus.shouldSkip) {
      return {
        message: 'Project generation already in progress or completed',
        status: projectStatus.status,
        sandboxId:
          'sandboxId' in projectStatus ? projectStatus.sandboxId : undefined,
      }
    }

    const startTime = Date.now()
    const sandboxId = await step.run('get-sandbox-id', async () => {
      await publish(projectChannel(event.data.projectId).status({
        functionId: 'get-sandbox-id',
        phase: 'started',
        message: 'Getting sandbox ID'
      }))
      const sandbox = await Sandbox.create('luci-ai-nextjs')
      await sandbox.setTimeout(SANDBOX_TIMEOUT)
      await prisma.project.update({
        where: { id: event.data.projectId },
        data: { sandboxId: sandbox.sandboxId },
      })
      await publish(projectChannel(event.data.projectId).status({
        functionId: 'get-sandbox-id',
        phase: 'started',
        message: 'Created sandbox for the project'
      }))
      return sandbox.sandboxId
    })

    const previousMessages = await step.run('get-previous-messages', () =>
      getPreviousMessages(event.data.projectId),
    )

    const state = createState<AgentState>(
      { summary: '', files: {} },
      { messages: previousMessages },
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

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary,
    )
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary,
    )

    const isError = !result.state.data.summary
    if (isError) {
      await publish(projectChannel(event.data.projectId).status({
        functionId: 'code-agent',
        phase: 'failed',
        message: 'Failed to generate summary'
      }))
      await step.run('save-error-result', () =>
        saveErrorResult(event.data.projectId),
      )
      return { error: 'Failed to generate summary.' }
    }

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      await publish(projectChannel(event.data.projectId).status({
        functionId: 'get-sandbox-url',
        phase: 'started',
        message: 'Getting sandbox URL'
      }))
      const sandbox = await getSandbox(sandboxId)
      const host = await sandbox.getHost(3000)
      return `https://${host}`
    })

    await step.run('process-and-save-files', async () => {
      await publish(projectChannel(event.data.projectId).status({
        functionId: 'process-and-save-files',
        phase: 'started',
        message: 'Processing and saving files',
      }))
      const sandbox = await getSandbox(sandboxId)
      const allSandboxFiles = await getAllSandboxTextFiles(sandbox)

      if (Object.keys(allSandboxFiles).length === 0) {
        await saveErrorResult(event.data.projectId)
        throw new Error('No text files found in the sandbox.')
      }

      const generationTime = (Date.now() - startTime) / 1000

      await saveSuccessResult({
        projectId: event.data.projectId,
        newProjectName: parseAgentOutput(fragmentTitleOutput),
        responseText: parseAgentOutput(responseOutput),
        sandboxUrl: sandboxUrl,
        allSandboxFiles: allSandboxFiles,
        generationTime: generationTime,
      })
    })

    await publish(projectChannel(event.data.projectId).status({
      functionId: 'code-agent',
      phase: 'completed',
      message: 'Project created successfully'
    }))

    return {
      message: 'Project processed successfully',
      url: sandboxUrl,
      summary: result.state.data.summary,
    }
  },
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

    await step.run('update-files-and-db', async () => {
      const sandbox = await getSandbox(sandboxId)

      for (const file of filesToUpdate) {
        await sandbox.files.write(file.path, file.content)
      }

      const allSandboxFiles = await getAllSandboxTextFiles(sandbox)

      await updateFragmentFilesInDb(projectId, allSandboxFiles)

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

    await step.run('execute-file-operations-and-update-db', async () => {
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

      const allSandboxFiles = await getAllSandboxTextFiles(sandbox)

      await updateFragmentFilesInDb(projectId, allSandboxFiles)

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
