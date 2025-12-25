import { ChatCompletionTool } from 'openai/resources/chat/completions'
import { CREATE_PROJECT_FN_NAME, CREATE_IMAGE_TOOL_NAME } from '@/modules/projects/constants'

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: CREATE_PROJECT_FN_NAME,
      description: `
      CALL THIS FUNCTION ONLY when the user explicitly requests to create,
      start, or generate a new software project, application, website, or complete feature set.
      This tool initiates the creation of a full project based on the user's detailed requirements.
      DO NOT call this tool for simple questions, information retrieval, or modifying an existing project.
      The input MUST be a comprehensive summary of all stated project requirements.`
      ,
      parameters: {
        type: 'object',
        properties: {
          project_details_summary: {
            type: 'string',
            description: `
            A comprehensive, detailed summary of the entire project scope.
            This must include: the main topic (e.g., 'e-commerce'), the key functionality
            (e.g., 'user authentication, product catalog, payment integration'), the target audience,
            and any specific technologies or design constraints mentioned by the user. 
            If the user provides a short request, expand it to capture all implied technical and functional requirements.`,
          },
        },
        required: ['project_details_summary'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: CREATE_IMAGE_TOOL_NAME,
      description:
        `Generates an image based on a detailed text prompt. 
         CALL THIS FUNCTION whenever the user asks to draw, paint, create a picture, visualize, generate a photo, design a logo, or see something.
         Do not try to describe the image with text words; strictly use this tool.
         The input 'prompt' must be a highly detailed, descriptive string in English optimized for image generation model.`,
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'A detailed, descriptive prompt for the image generation model. If the user provides a short request, expand it into a full visual description.',
          },
          aspect_ratio: {
            type: 'string',
            enum: ['16:9', '9:16', '3:2', '2:3', '4:3', '3:4', '1:1'],
            description: 'The size/aspect ratio of the image.',
          },
        },
        required: ['prompt'],
      },
    },
  },
]

