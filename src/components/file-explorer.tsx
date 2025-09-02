import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import { Hint } from './hint'
import { Button } from './ui/button'
import { CopyCheckIcon, CopyIcon, UploadCloudIcon } from 'lucide-react'
import { convertFilesToTreeItems } from '@/lib/utils'
import { TreeView } from './tree-view'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { TreeItem } from '@/types'
import { toast } from 'sonner'
import { CodeEditor } from './code-editor'
import { ScrollArea } from './ui/scroll-area'

type FileCollection = {
  [path: string]: string
}

// app.tsx => tsx
function getLanguageFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension || 'text'
}

interface FileBreadcrumbProps {
  filePath: string
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegment = filePath.split('/')
  const maxSegments = 4

  const renderBreadcrumbItems = () => {
    if (pathSegment.length <= maxSegments) {
      return pathSegment.map((segment, index) => {
        const isLast = index === pathSegment.length - 1
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
        )
      })
    } else {
      const firstSegment = pathSegment[0]
      const lastSegments = pathSegment[pathSegment.length - 1]

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
      )
    }
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  )
}

const sortTreeItems = (a: TreeItem, b: TreeItem): number => {
  const isAFolder = Array.isArray(a)
  const isBFolder = Array.isArray(b)

  if (isAFolder && !isBFolder) return -1
  if (!isAFolder && isBFolder) return 1

  const nameA = isAFolder ? a[0] : a
  const nameB = isBFolder ? b[0] : b

  return nameA.localeCompare(nameB)
}

const sortTreeRecursively = (items: TreeItem[]): TreeItem[] => {
  const sortedItems = [...items].sort(sortTreeItems)

  return sortedItems.map((item) => {
    if (Array.isArray(item)) {
      const folderName = item[0]
      const children = item.slice(1) as TreeItem[]
      const sortedChildren = sortTreeRecursively(children)
      return [folderName, ...sortedChildren]
    }
    return item
  })
}

interface FileExplorerProps {
  files: FileCollection
  projectId: string
}

export const FileExplorer = ({ files, projectId }: FileExplorerProps) => {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const [editedFiles, setEditedFiles] = useState<FileCollection>(files)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setEditedFiles(files)

    if (selectedFile && files[selectedFile] === undefined) {
      setSelectedFile(null)
    }
  }, [files, selectedFile])

  const treeData = useMemo(() => {
    const unsortedTree = convertFilesToTreeItems(files) as TreeItem[]
    return sortTreeRecursively(unsortedTree)
  }, [files])

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath)
      }
    },
    [files]
  )

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(editedFiles[selectedFile])
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }, [selectedFile, editedFiles])

  // Обработчик изменений в редакторе
  const handleCodeChange = useCallback(
    (newContent: string | undefined) => {
      if (selectedFile && typeof newContent === 'string') {
        setEditedFiles((prev) => ({
          ...prev,
          [selectedFile]: newContent,
        }))
      }
    },
    [selectedFile]
  )

  const handleUpdateSandbox = async () => {
    const filesToUpdate = Object.keys(editedFiles)
      .filter((path) => files[path] !== editedFiles[path])
      .map((path) => ({
        path,
        content: editedFiles[path],
      }))

    if (filesToUpdate.length === 0) {
      toast.info('No changes to update.')
      return
    }

    setIsUpdating(true)
    const promise = fetch(`/api/project/${projectId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filesToUpdate }),
    })

    toast.promise(promise, {
      loading: 'Starting sandbox update...',
      success: () => {
        return 'Update process started successfully!'
      },
      error: 'Failed to update sandbox.',
      finally: () => {
        setIsUpdating(false)
      },
    })
  }

  const hasChanges = useMemo(() => {
    return JSON.stringify(files) !== JSON.stringify(editedFiles)
  }, [files, editedFiles])

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30} minSize={20} className="bg-sidebar">
        <ScrollArea className="h-full">
          <TreeView
            data={treeData}
            value={selectedFile}
            onSelect={handleFileSelect}
          />
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors" />
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && editedFiles[selectedFile] !== undefined ? (
          <div className="flex h-full w-full flex-col">
            <div className="bg-sidebar flex items-center justify-between gap-x-2 border-b px-4 py-2">
              <FileBreadcrumb filePath={selectedFile} />
              <div className="ml-auto flex items-center gap-x-2">
                <Hint text="Update Sandbox" side="bottom">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleUpdateSandbox}
                    disabled={!hasChanges || isUpdating}
                  >
                    <UploadCloudIcon className="h-5 w-5" />
                  </Button>
                </Hint>
                <Hint text="Copy to clipboard" side="bottom">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? (
                      <CopyCheckIcon className="h-5 w-5" />
                    ) : (
                      <CopyIcon className="h-5 w-5" />
                    )}
                  </Button>
                </Hint>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeEditor
                code={editedFiles[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
                onChange={handleCodeChange}
              />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Select a file to view its content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
