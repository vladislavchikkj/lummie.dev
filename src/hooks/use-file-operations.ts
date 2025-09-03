import { useState, useRef, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { FileOperationType, ItemType } from '@/types'

interface UseFileOperationsProps {
  projectId: string
}

export const useFileOperations = ({ projectId }: UseFileOperationsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [operationType, setOperationType] = useState<FileOperationType | null>(
    null
  )
  const [operationPath, setOperationPath] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [itemType, setItemType] = useState<ItemType>('file')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openDialog = useCallback(
    (type: FileOperationType, path: string, newItemType: ItemType = 'file') => {
      setOperationType(type)
      setOperationPath(path)
      setItemType(newItemType)
      setError(null)
      setItemName(type === 'rename' ? path.split('/').pop() || '' : '')
      setIsDialogOpen(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    },
    []
  )

  const closeDialog = () => {
    setIsDialogOpen(false)
    // Сброс состояния после закрытия
    setTimeout(() => {
      setOperationType(null)
      setOperationPath('')
      setItemName('')
      setError(null)
    }, 300) // Задержка для анимации закрытия
  }

  const handleSubmit = async () => {
    setError(null)

    if (!itemName.trim() && operationType !== 'delete') {
      setError('Name cannot be empty.')
      return
    }
    if (
      itemName.includes('/') &&
      (operationType === 'create' || operationType === 'rename')
    ) {
      setError('Name cannot contain slashes. Use folders for structure.')
      return
    }

    const operations = []
    if (operationType === 'create') {
      const parentDir = operationPath ? `${operationPath}/` : ''
      operations.push({
        type: 'create',
        path: `${parentDir}${itemName}`,
        itemType,
      })
    } else if (operationType === 'rename') {
      const parentDir = operationPath.substring(
        0,
        operationPath.lastIndexOf('/') + 1
      )
      operations.push({
        type: 'rename',
        oldPath: operationPath,
        newPath: `${parentDir}${itemName}`,
      })
    } else if (operationType === 'delete') {
      operations.push({ type: 'delete', path: operationPath })
    } else {
      setError('Invalid operation type.')
      return
    }

    setIsUpdating(true)
    const promise = fetch(`/api/project/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations }),
    })

    toast.promise(promise, {
      loading: `${operationType === 'create' ? 'Creating' : operationType === 'rename' ? 'Renaming' : 'Deleting'} item...`,
      success: () => {
        closeDialog()
        return `Operation "${operationType}" started successfully! File explorer will update shortly.`
      },
      error: (err) => err?.message || `Failed to ${operationType} item.`,
      finally: () => setIsUpdating(false),
    })
  }

  const dialogContent = useMemo(() => {
    switch (operationType) {
      case 'create':
        return {
          title: `Create New ${itemType === 'file' ? 'File' : 'Folder'}`,
          description: `Enter a name for the new ${itemType === 'file' ? 'file' : 'folder'} in "${operationPath || 'root'}".`,
        }
      case 'rename':
        return {
          title: `Rename ${operationPath.split('/').pop()}`,
          description: `Enter a new name for "${operationPath}".`,
        }
      case 'delete':
        return {
          title: `Delete ${operationPath.split('/').pop()}`,
          description: `Are you sure you want to delete "${operationPath}"? This action cannot be undone.`,
        }
      default:
        return { title: 'File Operation', description: '' }
    }
  }, [operationType, itemType, operationPath])

  return {
    isDialogOpen,
    isUpdating,
    operationType,
    itemName,
    error,
    inputRef,
    dialogContent,
    openDialog,
    closeDialog,
    handleSubmit,
    setItemName,
  }
}
