import { prisma } from '@/lib/db'
import { TextMessage, type Message } from '@inngest/agent-kit'

export async function getPreviousMessages(
  projectId: string
): Promise<Message[]> {
  const messages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return messages
    .map(
      (message): TextMessage => ({
        type: 'text',
        role: message.role === 'ASSISTANT' ? 'assistant' : 'user',
        content: message.content,
      })
    )
    .reverse()
}

export async function saveErrorResult(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'ERROR' },
  })

  await prisma.message.create({
    data: {
      projectId: projectId,
      content: 'Something went wrong. Please try again',
      role: 'ASSISTANT',
      type: 'ERROR',
    },
  })
}

interface SaveSuccessResultArgs {
  projectId: string
  newProjectName: string
  responseText: string
  sandboxUrl: string
  allSandboxFiles: { [path: string]: string }
  generationTime?: number
}

export async function saveSuccessResult(args: SaveSuccessResultArgs) {
  const {
    projectId,
    newProjectName,
    responseText,
    sandboxUrl,
    allSandboxFiles,
    generationTime,
  } = args

  return await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: {
        name: newProjectName,
        status: 'COMPLETED',
      },
    }),
    prisma.message.create({
      data: {
        projectId: projectId,
        content: responseText,
        role: 'ASSISTANT',
        type: 'RESULT',
        generationTime: generationTime,
        fragment: {
          create: {
            sandboxUrl: sandboxUrl,
            title: newProjectName,
            files: allSandboxFiles,
          },
        },
      },
    }),
  ])
}

export async function updateFragmentFilesInDb(
  projectId: string,
  allSandboxFiles: { [path: string]: string }
) {
  const latestMessageWithFragment = await prisma.message.findFirst({
    where: {
      projectId: projectId,
      fragment: { isNot: null },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      fragment: { select: { id: true } },
    },
  })

  if (latestMessageWithFragment?.fragment?.id) {
    await prisma.fragment.update({
      where: { id: latestMessageWithFragment.fragment.id },
      data: { files: allSandboxFiles },
    })
  } else {
    console.warn(`No fragment found to update for project ${projectId}`)
  }
}
