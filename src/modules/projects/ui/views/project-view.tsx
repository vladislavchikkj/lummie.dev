"use client";

import { Suspense, useState } from "react";

import { Fragment } from "@/generated/prisma";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Skeleton } from "@/components/ui/skeleton";
import { MessagesContainer } from "../components/messages-container";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";
import { UserMenu } from "@/modules/home/ui/components/navbar/user-menu";
import Logo from "@/components/ui/logo";

interface Props {
  projectId: string;
}

const ProjectHeaderSkeleton = () => (
  <div className="flex items-center gap-3 p-3 border-b">
    <Skeleton className="h-6 w-6 rounded-lg" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-2 w-32 rounded-xs" />
      <Skeleton className="h-2 w-20 rounded-xs" />
    </div>
  </div>
);

const PreviewPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-background text-muted-foreground rounded-lg">
    <Logo width={70} height={70} className="opacity-50" />
    <p className="mt-6 text-lg font-medium text-center animate-shimmer bg-[linear-gradient(110deg,#939393,45%,#e0e0e0,55%,#939393)] bg-[length:200%_100%] bg-clip-text text-transparent">
      Preview will be ready soon...
    </p>
  </div>
);

const CodePlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-background text-muted-foreground rounded-lg">
    <FileCode2 size={64} strokeWidth={1.5} />
    <p className="mt-4 text-lg font-medium text-center">Code not found</p>
    <p className="text-sm mt-1">Select a fragment to see its files</p>
  </div>
);

export const ProjectView = ({ projectId }: Props) => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          {/* Left panel unchanged */}
          <ErrorBoundary fallback={<p>Header error</p>}>
            <Suspense fallback={<ProjectHeaderSkeleton />}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary
            fallback={<p className="p-2">Messages container error</p>}
          >
            <Suspense fallback={<></>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />
        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className="h-full flex flex-col gap-y-0"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2 h-12">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon /> <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                {!hasProAccess && (
                  <Button asChild size="sm" variant="default">
                    <Link href="/pricing">
                      <CrownIcon /> Upgrade
                    </Link>
                  </Button>
                )}
                <UserMenu />
              </div>
            </div>

            {/* --- IMPROVED DISPLAY LOGIC --- */}
            <TabsContent value="preview" className="flex-1 min-h-0">
              {activeFragment ? (
                <FragmentWeb data={activeFragment} />
              ) : (
                <PreviewPlaceholder />
              )}
            </TabsContent>
            <TabsContent value="code" className="min-h-0 flex-1">
              {activeFragment?.files ? (
                <FileExplorer
                  files={activeFragment.files as { [path: string]: string }}
                  projectId={projectId}
                />
              ) : (
                <CodePlaceholder />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
