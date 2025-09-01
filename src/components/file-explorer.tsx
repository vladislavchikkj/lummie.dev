import { Fragment, useCallback, useMemo, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { CodeView } from "./code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { TreeItem } from "@/types";

type FileCollection = {
  [path: string]: string;
};

// app.tsx => tsx
function getLanguageFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
}

interface FileBreadcrumbProps {
  filePath: string;
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegment = filePath.split("/");
  const maxSegments = 4;

  const renderBreadcrumbItems = () => {
    if (pathSegment.length <= maxSegments) {
      return pathSegment.map((segment, index) => {
        const isLast = index === pathSegment.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegment[0];
      const lastSegments = pathSegment[pathSegment.length - 1];

      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegment}</span>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {lastSegments}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbItem>
        </>
      );
    }
  };
  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};

const sortTreeItems = (a: TreeItem, b: TreeItem): number => {
  const isAFolder = Array.isArray(a);
  const isBFolder = Array.isArray(b);

  if (isAFolder && !isBFolder) return -1;
  if (!isAFolder && isBFolder) return 1;

  const nameA = isAFolder ? a[0] : a;
  const nameB = isBFolder ? b[0] : b;

  return nameA.localeCompare(nameB);
};

const sortTreeRecursively = (items: TreeItem[]): TreeItem[] => {
  const sortedItems = [...items].sort(sortTreeItems);

  return sortedItems.map((item) => {
    if (Array.isArray(item)) {
      const folderName = item[0];
      const children = item.slice(1) as TreeItem[];
      const sortedChildren = sortTreeRecursively(children);
      return [folderName, ...sortedChildren];
    }

    return item;
  });
};

interface FileExplorerProps {
  files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => {
    const unsortedTree = convertFilesToTreeItems(files) as TreeItem[];
    return sortTreeRecursively(unsortedTree);
  }, [files]);

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files]
  );

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [selectedFile, files]);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors" />
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text="Copy to clipboard" side="bottom">
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? <CopyCheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view its content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
