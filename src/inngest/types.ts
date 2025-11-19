export const SANDBOX_TIMEOUT = 60_000 * 10 * 3 // 30 minutes

export type FileOperation =
  | { type: 'create'; path: string; itemType: 'file' | 'folder' }
  | { type: 'delete'; path: string }
  | { type: 'rename'; oldPath: string; newPath: string }

export type ReasoningEventType = 'thinking' | 'action' | 'step'

export interface ReasoningEvent {
  type: ReasoningEventType
  phase?: 'started' | 'in-progress' | 'completed' | 'failed'
  title: string
  description?: string
  duration?: number // Duration in seconds
  timestamp: number
  metadata?: Record<string, any>
}
