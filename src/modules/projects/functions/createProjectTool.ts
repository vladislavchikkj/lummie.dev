import { inngest } from '@/inngest/client'
import { prisma } from '@/lib/db'

export default async function createProjectTool({
  input,
}: {
  input: { value: string; projectId: string }
}) {
  console.log(`createProjectTool called for project ${input.projectId}`)

  // Проверяем статус проекта перед запуском генерации
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { status: true, sandboxId: true },
  })

  console.log(
    `Project ${input.projectId} status: ${project?.status}, sandboxId: ${project?.sandboxId}`
  )

  // Если проект уже завершен, не запускаем повторно
  if (project?.status === 'COMPLETED') {
    console.log(
      `Project ${input.projectId} is already completed, skipping generation`
    )
    return
  }

  // Если проект уже в процессе генерации (PENDING + есть sandboxId), не запускаем повторно
  if (project?.status === 'PENDING' && project.sandboxId) {
    console.log(
      `Project ${input.projectId} is already in progress with sandbox ${project.sandboxId}, skipping generation`
    )
    return
  }

  // Если проект в состоянии ERROR, можно попробовать снова
  if (project?.status === 'ERROR') {
    // Обновляем статус на PENDING перед запуском
    await prisma.project.update({
      where: { id: input.projectId },
      data: { status: 'PENDING' },
    })
  }

  console.log(`Sending code-agent/run event for project ${input.projectId}`)

  await inngest.send({
    name: 'code-agent/run',
    data: {
      value: input.value,
      projectId: input.projectId,
    },
  })

  console.log(`code-agent/run event sent for project ${input.projectId}`)
}
