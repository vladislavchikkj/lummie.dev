'use client'

import { ChevronDown, Lock, Menu, Edit2, Trash2, Home } from 'lucide-react'
import Logo from '@/components/ui/logo'
import { useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProjectHeaderContentProps {
  projectName: string
  projectId?: string
  isPrivate?: boolean
}

export const ProjectHeaderContent = ({
  projectName,
  projectId,
  isPrivate = false,
}: ProjectHeaderContentProps) => {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newName, setNewName] = useState(projectName)

  const updateMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions())
        queryClient.invalidateQueries(
          trpc.projects.getOne.queryOptions({ id: projectId! })
        )
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
        queryClient.invalidateQueries(
          trpc.projects.getManyWithPreview.queryOptions()
        )
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
    if (newName.trim() && newName !== projectName && projectId) {
      updateMutation.mutate({
        id: projectId,
        name: newName.trim(),
      })
    }
  }

  const handleDelete = () => {
    if (projectId) {
      deleteMutation.mutate({ id: projectId })
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg bg-transparent transition-colors">
        {/* Mobile: Menu icon that toggles sidebar */}
        <div
          className="flex cursor-pointer items-center gap-1 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </div>

        {/* Desktop: Logo link to home */}
        <Link
          href="/"
          className="hidden cursor-pointer items-center gap-1 transition-all hover:opacity-80 md:flex"
        >
          <Logo width={24} height={24} />
        </Link>

        <div className="bg-border h-6 w-px" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-accent/50 flex items-center gap-2 rounded-md px-2 py-1 transition-colors">
              <div className="flex flex-col items-start justify-center">
                <div className="flex items-center gap-1.5 pb-1">
                  <span className="text-foreground text-sm leading-none font-semibold">
                    {projectName}
                  </span>
                  {isPrivate && (
                    <Lock className="text-muted-foreground h-3 w-3" />
                  )}
                </div>
                <span className="text-muted-foreground text-xs leading-none">
                  View Projects
                </span>
              </div>
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>View All Projects</span>
              </Link>
            </DropdownMenuItem>
            {projectId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setNewName(projectName)
                    setIsRenameDialogOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Rename Chat</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Chat</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rename Modal */}
      {isRenameDialogOpen && projectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsRenameDialogOpen(false)}
          />
          <div
            className="bg-background relative z-[101] w-full max-w-md rounded-xl border p-6 shadow-xl"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
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
                    newName === projectName
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
      {isDeleteDialogOpen && projectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsDeleteDialogOpen(false)}
          />
          <div
            className="bg-background relative z-[101] w-full max-w-md rounded-xl border p-6 shadow-xl"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Logo width={16} height={16} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Delete Chat</h2>
                <p className="text-muted-foreground text-sm">
                  Are you sure you want to delete &quot;{projectName}&quot;?
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
