import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CodeEditor } from '@/components/code-editor'
import { TreeView } from './tree-view'

import { FileCollection, TreeItem } from '@/types'
import {
  convertFilesToTreeItems,
  getLanguageFromExtension,
  sortTreeRecursively,
} from '@/lib/utils'
import { useFileOperations } from '@/hooks/use-file-operations'
import { EditorHeader } from './editor-header'
import { EditorPlaceholder } from './editor-placeholder'
import { FileOperationDialog } from './file-operation-dialog'

interface FileExplorerProps {
  files: FileCollection
  projectId: string
}

export const FileExplorer = ({ files, projectId }: FileExplorerProps) => {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [editedFiles, setEditedFiles] = useState<FileCollection>(files)
  const [isUpdatingSandbox, setIsUpdatingSandbox] = useState(false)

  // Используем наш кастомный хук для всей логики диалогового окна
  const fileOps = useFileOperations({ projectId })

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
      if (typeof files[filePath] === 'string') {
        setSelectedFile(filePath)
      }
    },
    [files]
  )

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(editedFiles[selectedFile])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [selectedFile, editedFiles])

  const handleCodeChange = useCallback(
    (newContent: string | undefined) => {
      if (selectedFile && typeof newContent === 'string') {
        setEditedFiles((prev) => ({ ...prev, [selectedFile]: newContent }))
      }
    },
    [selectedFile]
  )

  const hasChanges = useMemo(() => {
    return JSON.stringify(files) !== JSON.stringify(editedFiles)
  }, [files, editedFiles])

  const handleUpdateSandbox = async () => {
    const filesToUpdate = Object.keys(editedFiles)
      .filter((path) => files[path] !== editedFiles[path])
      .map((path) => ({ path, content: editedFiles[path] }))

    if (filesToUpdate.length === 0) {
      toast.info('No changes to update.')
      return
    }

    setIsUpdatingSandbox(true)
    const promise = fetch(`/api/project/${projectId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filesToUpdate }),
    })

    toast.promise(promise, {
      loading: 'Starting sandbox update...',
      success:
        'Update process started successfully! Changes will appear shortly.',
      error: 'Failed to update sandbox.',
      finally: () => setIsUpdatingSandbox(false),
    })
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={20} className="bg-sidebar">
          <ScrollArea className="h-full">
            <TreeView
              data={treeData}
              value={selectedFile}
              onSelect={handleFileSelect}
              onFileOperation={(type, path, newPath, itemType) =>
                fileOps.openDialog(type, path, itemType)
              }
            />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />
        <ResizablePanel defaultSize={70} minSize={50}>
          {selectedFile && editedFiles[selectedFile] !== undefined ? (
            <div className="flex h-full w-full flex-col">
              <EditorHeader
                filePath={selectedFile}
                onUpdate={handleUpdateSandbox}
                onCopy={handleCopy}
                hasChanges={hasChanges}
                isUpdating={isUpdatingSandbox}
                isCopied={copied}
              />
              <div className="flex-1 overflow-auto">
                <CodeEditor
                  code={editedFiles[selectedFile]}
                  lang={getLanguageFromExtension(selectedFile)}
                  onChange={handleCodeChange}
                />
              </div>
            </div>
          ) : (
            <EditorPlaceholder />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <FileOperationDialog
        isOpen={fileOps.isDialogOpen}
        onOpenChange={(isOpen) => !isOpen && fileOps.closeDialog()}
        onSubmit={fileOps.handleSubmit}
        isSubmitting={fileOps.isUpdating}
        operationType={fileOps.operationType}
        dialogContent={fileOps.dialogContent}
        itemName={fileOps.itemName}
        onItemNameChange={fileOps.setItemName}
        error={fileOps.error}
        inputRef={fileOps.inputRef}
      />
    </>
  )
}
