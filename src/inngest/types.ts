export const SANDBOX_TIMEOUT = 60_000 * 10 * 3 // 30 minutes

export type FileOperation =
  | { type: 'create'; path: string; itemType: 'file' | 'folder' }
  | { type: 'delete'; path: string }
  | { type: 'rename'; oldPath: string; newPath: string }
