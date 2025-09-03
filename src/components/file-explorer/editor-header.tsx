import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'
import { CopyCheckIcon, CopyIcon, UploadCloudIcon } from 'lucide-react'
import { FileBreadcrumb } from './file-breadcrumb'

interface EditorHeaderProps {
  filePath: string
  onUpdate: () => void
  onCopy: () => void
  hasChanges: boolean
  isUpdating: boolean
  isCopied: boolean
}

export const EditorHeader = ({
  filePath,
  onUpdate,
  onCopy,
  hasChanges,
  isUpdating,
  isCopied,
}: EditorHeaderProps) => {
  return (
    <div className="bg-sidebar flex items-center justify-between gap-x-2 border-b px-4 py-2">
      <FileBreadcrumb filePath={filePath} />
      <div className="ml-auto flex items-center gap-x-2">
        <Hint text="Update Sandbox" side="bottom">
          <Button
            variant="default"
            size="icon"
            onClick={onUpdate}
            disabled={!hasChanges || isUpdating}
          >
            <UploadCloudIcon className="h-5 w-5" />
          </Button>
        </Hint>
        <Hint text="Copy to clipboard" side="bottom">
          <Button
            variant="outline"
            size="icon"
            onClick={onCopy}
            disabled={isCopied}
          >
            {isCopied ? (
              <CopyCheckIcon className="h-5 w-5" />
            ) : (
              <CopyIcon className="h-5 w-5" />
            )}
          </Button>
        </Hint>
      </div>
    </div>
  )
}
