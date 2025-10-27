'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Logo from '@/components/ui/logo'

interface ProjectMenuProps {
  projectId: string
  currentName: string
}

export const ProjectMenu = ({ projectId, currentName }: ProjectMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Calculate dropdown position with bounds checking
  const getDropdownPosition = () => {
    if (!triggerRect) return { top: 0, left: 0 }

    const dropdownWidth = 192 // w-48 = 192px
    const dropdownHeight = 80 // Approximate height of dropdown
    const margin = 5

    let top = triggerRect.bottom + margin
    let left = triggerRect.right - dropdownWidth

    // Check if dropdown goes off the right edge
    if (left < 0) {
      left = triggerRect.left - dropdownWidth
    }

    // Check if dropdown goes off the bottom edge
    if (top + dropdownHeight > window.innerHeight) {
      top = triggerRect.top - dropdownHeight - margin
    }

    // Ensure dropdown doesn't go off the left edge
    if (left < 0) {
      left = margin
    }

    // Ensure dropdown doesn't go off the top edge
    if (top < 0) {
      top = margin
    }

    return { top, left }
  }

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newName, setNewName] = useState(currentName)

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setTriggerRect(rect)
    } else if (!isOpen) {
      setTriggerRect(null)
    }
  }, [isOpen])

  const updateMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions())
        setIsRenameDialogOpen(false)
        toast.success('Chat renamed successfully')
      },
      onError: (error) => {
        toast.error('Failed to rename chat')
        console.error('Rename error:', error)
      },
    })
  )

  const deleteMutation = useMutation(
    trpc.projects.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions())
        setIsDeleteDialogOpen(false)
        toast.success('Chat deleted successfully')
        router.push('/')
      },
      onError: (error) => {
        toast.error('Failed to delete chat')
        console.error('Delete error:', error)
      },
    })
  )

  const handleRename = () => {
    if (newName.trim() && newName !== currentName) {
      updateMutation.mutate({
        id: projectId,
        name: newName.trim(),
      })
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate({ id: projectId })
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 transition-all duration-200 hover:bg-transparent"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <MoreHorizontal className="text-muted-foreground hover:text-primary h-4 w-4 transition-colors duration-200 hover:bg-transparent" />
      </Button>

      {isOpen && triggerRect && (
        <div
          className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 w-48 min-w-[8rem] overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm duration-200"
          style={{
            position: 'fixed',
            ...getDropdownPosition(),
            zIndex: 50,
          }}
        >
          <div
            className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setNewName(currentName)
              setIsRenameDialogOpen(true)
              setIsOpen(false)
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </div>
          <div
            className="hover:bg-accent relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-red-500 transition-colors duration-200 hover:text-red-500"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
              setIsOpen(false)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Rename Modal */}
      {isRenameDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsRenameDialogOpen(false)}
          />
          <div className="bg-background relative z-[101] w-full max-w-md rounded-xl border p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Logo width={16} height={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Rename Chat</h2>
                <p className="text-muted-foreground text-sm">
                  Enter a new name for your chat.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter chat name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename()
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsRenameDialogOpen(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRename}
                  disabled={
                    updateMutation.isPending ||
                    !newName.trim() ||
                    newName === currentName
                  }
                  className="bg-primary hover:bg-primary/90 rounded-lg"
                >
                  {updateMutation.isPending ? 'Renaming...' : 'Rename'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsDeleteDialogOpen(false)}
          />
          <div className="bg-background relative z-[101] w-full max-w-md rounded-xl border p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Logo width={16} height={16} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Delete Chat</h2>
                <p className="text-muted-foreground text-sm">
                  Are you sure you want to delete &quot;{currentName}&quot;?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-lg"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
