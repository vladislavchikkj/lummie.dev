'use client'

import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from '@/components/ui/shadcn-io/ai/task'
import { SiReact, SiTailwindcss, SiTypescript } from '@icons-pack/react-simple-icons'
import { cn } from '@/lib/utils'
import { useProjectRealtimeStatus } from '@/modules/projects/hooks/useProjectRealtimeStatus'

type ReasoningRealtimeProps = {
  projectId: string
  maxVisible?: number
  showLoadingFallback?: boolean
}

export const ReasoningRealtime = ({
                                    projectId,
                                    maxVisible = 3,
                                    showLoadingFallback = false
                                  }: ReasoningRealtimeProps) => {
  const { data, latestData, state, error } = useProjectRealtimeStatus(projectId)
  console.log('ReasoningRealtime data:', data, 'state:', state, 'error:', error)
  const isConnected = state === "active"
  const isError = !!error

  // Ограничиваем видимые сообщения
  const visibleMessages = data.slice(-maxVisible)

  // Иконки по functionId (расширяемо!)
  const getIcon = (functionId: string) => {
    if (functionId.includes('layout') || functionId.includes('tsx'))
      return <SiReact className="size-4" color="#149ECA" />
    if (functionId.includes('tailwind'))
      return <SiTailwindcss className="size-4" color="#38BDF8" />
    if (functionId.includes('tsconfig') || functionId.includes('typescript'))
      return <SiTypescript className="size-4" color="#3178C6" />
    return null
  }

  // Текст по фазе
  const getPhaseText = (phase: string, message?: string) => {
    switch (phase) {
      case 'started': return `Запуск... ${message}`
      case 'in-progress': return message ? `Выполняется: ${message}` : 'В процессе...'
      case 'completed': return `Готово ${message}`
      case 'failed': return `Ошибка! ${message}`
      default: return phase
    }
  }

  const renderMessage = (msg: typeof data[number]) => {
    const { functionId, phase, step, message } = msg.data
    const icon = getIcon(functionId)

    return (
      <TaskItem
        key={ Math.random().toString(36).substring(2)}
        className="animate-in slide-in-from-bottom-2 duration-300"
      >
        <span className="inline-flex items-center gap-1.5">
          {icon && <TaskItemFile>{icon}</TaskItemFile>}
          <span className={cn(
            phase === 'failed' && 'text-red-600 font-medium',
            phase === 'completed' && 'text-green-600 font-medium'
          )}>
            {getPhaseText(phase, message)}
          </span>
          {step && (
            <code className="ml-1 text-xs opacity-70 font-mono">
              [{step}]
            </code>
          )}
        </span>
      </TaskItem>
    )
  }

  if (isError) {
    return (
      <div className="text-red-500 text-sm">
        Ошибка подключения: {error.message}
      </div>
    )
  }

  if (isConnected && data.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        Ожидание активности...
      </div>
    )
  }

  return (
    <div className="group is-assistant flex w-full flex-row-reverse items-end justify-end gap-2">
      <div className="text-foreground flex flex-col gap-2 overflow-hidden rounded-2xl px-4 py-3 group-[.is-assistant]:ml-4 group-[.is-assistant]:max-w-full">
        <div className="is-user:dark flex flex-col gap-4">
          <Task className="w-full">
            <TaskTrigger
              title="Генерация проекта..."
            />
            <TaskContent>
              {visibleMessages.map(renderMessage)}
            </TaskContent>
          </Task>
        </div>
      </div>
    </div>
  )
}