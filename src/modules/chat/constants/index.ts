export const CHAT_ROLES = {
  USER: 'USER' as const,
  ASSISTANT: 'ASSISTANT' as const,
}

export const CHAT_MESSAGE_TYPES = {
  TEXT: 'TEXT' as const,
  IMAGE: 'IMAGE' as const,
}

export const FIRST_INDEX = 0

export const CHAT_ERROR_MESSAGE_FRAGMENT =
  '\n\n[Error generating response. Please try again.]'

export const ORDER_DESC = 'desc'
export const ORDER_ASC = 'asc'
