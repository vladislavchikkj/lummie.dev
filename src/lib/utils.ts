import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { type TreeItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertFilesToTreeItems(
  files: Record<string, string>
): TreeItem[] {
  interface TreeNode {
    [key: string]: TreeNode | null
  }

  const tree: TreeNode = {}

  const sortedPaths = Object.keys(files).sort()

  for (const filePath of sortedPaths) {
    const parts = filePath.split('/')
    let current = tree

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    const fileName = parts[parts.length - 1]
    current[fileName] = null
  }

  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node)

    if (entries.length === 0) {
      return name || ''
    }

    const children: TreeItem[] = []

    for (const [key, value] of entries) {
      if (value === null) {
        // It's a file
        children.push(key)
      } else {
        // It's a folder
        const subTree = convertNode(value, key)
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree])
        } else {
          children.push([key, subTree])
        }
      }
    }

    return children
  }

  const result = convertNode(tree)
  return Array.isArray(result) ? result : [result]
}

export function getLanguageFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension || 'text'
}

export const sortTreeItems = (a: TreeItem, b: TreeItem): number => {
  const isAFolder = Array.isArray(a)
  const isBFolder = Array.isArray(b)

  if (isAFolder && !isBFolder) return -1
  if (!isAFolder && isBFolder) return 1

  const nameA = isAFolder ? a[0] : a
  const nameB = isBFolder ? b[0] : b

  return nameA.localeCompare(nameB)
}

export const sortTreeRecursively = (items: TreeItem[]): TreeItem[] => {
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
