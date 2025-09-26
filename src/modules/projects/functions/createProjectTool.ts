import { inngest } from '@/inngest/client'

export default async function createProjectTool({
  input,
}: {
  input: { value: string; projectId: string }
}) {
  await inngest.send({
    name: 'code-agent/run',
    data: {
      value: input.value,
      projectId: input.projectId,
    },
  })
}
