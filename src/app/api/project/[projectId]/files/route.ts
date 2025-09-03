import { inngest } from '@/inngest/client'
import { FileOperation } from '@/inngest/types'
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  operations: FileOperation[]
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { operations } = (await req.json()) as RequestBody
    const { projectId } = await params

    if (
      !projectId ||
      !operations ||
      !Array.isArray(operations) ||
      operations.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'Project ID and a non-empty array of operations are required',
        },
        { status: 400 }
      )
    }

    await inngest.send({
      name: 'code-agent/manage-files',
      data: {
        projectId,
        operations,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'File management process started',
    })
  } catch (error) {
    console.error('Failed to trigger project file management:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
