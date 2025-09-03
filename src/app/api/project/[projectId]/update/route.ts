import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { files } = (await req.json()) as {
      files: { path: string; content: string }[];
    };
    const { projectId } = await params;

    if (!projectId || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Project ID and files are required" },
        { status: 400 }
      );
    }

    await inngest.send({
      name: "code-agent/update",
      data: {
        projectId,
        filesToUpdate: files,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Update process started",
    });
  } catch (error) {
    console.error("Failed to trigger project update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
