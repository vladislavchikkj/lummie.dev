export type TreeItem = string | [string, ...TreeItem[]]

export type FileCollection = {
  [path: string]: string
}

export type FileOperationType = 'create' | 'rename' | 'delete'

export type ItemType = 'file' | 'folder'

export type FileOperationHandler = (
  type: FileOperationType,
  path: string,
  itemType?: ItemType
) => void
