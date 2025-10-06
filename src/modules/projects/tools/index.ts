import { ChatCompletionTool } from 'openai/resources/chat/completions'
import { CREATE_PROJECT_FN_NAME } from '@/modules/projects/constants'

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: CREATE_PROJECT_FN_NAME,
      description:
        'Function chat create a application project based on user request',
      parameters: {
        type: 'object',
        properties: {
          sign: {
            type: 'string',
            description: 'Project Name',
          },
        },
        required: ['testReq'],
      },
    },
  },
]
