import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'

import {
  codeAgentFunction,
  manageProjectFilesFunction,
  updateProjectFunction,
} from '@/inngest/functions'

// Create an API that serves all of our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codeAgentFunction,
    updateProjectFunction,
    manageProjectFilesFunction,
  ],
})
