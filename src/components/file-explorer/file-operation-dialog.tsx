import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import { FileOperationType } from '@/types'

interface FileOperationDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: () => void
  isSubmitting: boolean
  operationType: FileOperationType | null
  dialogContent: { title: string; description: string }
  itemName: string
  onItemNameChange: (value: string) => void
  error: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
}

export const FileOperationDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  operationType,
  dialogContent,
  itemName,
  onItemNameChange,
  error,
  inputRef,
}: FileOperationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(operationType === 'create' || operationType === 'rename') && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName" className="text-right">
                Name
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => onItemNameChange(e.target.value)}
                className="col-span-3"
                ref={inputRef}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) onSubmit()
                }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={
              isSubmitting || (operationType !== 'delete' && !itemName.trim())
            }
          >
            {isSubmitting
              ? 'Processing...'
              : operationType === 'create'
                ? 'Create'
                : operationType === 'rename'
                  ? 'Rename'
                  : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
