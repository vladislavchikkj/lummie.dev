'use client'

import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from '@/components/ui/shadcn-io/ai/task'
import {
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from '@icons-pack/react-simple-icons'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useRef, useState } from 'react'

const ALL_POSSIBLE_TASKS = [
  { value: 'Analyzing project requirements...' },
  { value: 'Scanning project structure...' },
  { value: 'Identifying key components...' },
  {
    value: (
      <span className="inline-flex items-center gap-1">
        Reading{' '}
        <TaskItemFile>
          <SiTypescript className="size-4" color="#3178C6" />
          <span>tsconfig.json</span>
        </TaskItemFile>
      </span>
    ),
  },
  { value: 'Planning UI/UX flow...' },
  { value: 'Generating component skeletons...' },
  {
    value: (
      <span className="inline-flex items-center gap-1">
        Creating{' '}
        <TaskItemFile>
          <SiReact className="size-4" color="#149ECA" />
          <span>layout.tsx</span>
        </TaskItemFile>
      </span>
    ),
  },
  {
    value: (
      <span className="inline-flex items-center gap-1">
        Applying styles from{' '}
        <TaskItemFile>
          <SiTailwindcss className="size-4" color="#38BDF8" />
          <span>tailwind.config.js</span>
        </TaskItemFile>
      </span>
    ),
  },
  { value: 'Assembling main page...' },
  { value: 'Finalizing structure...' },
  { value: 'Optimizing imports...' },
  { value: 'Running preliminary checks...' },
  { value: 'Configuring routing...' },
  { value: 'Setting up data fetching...' },
]

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

type TaskType = {
  key: string
  value: React.ReactNode
  isExiting?: boolean
}

export const ReasoningLoading = () => {
  const MAX_TASKS_VISIBLE = 3
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [phase, setPhase] = useState<'INITIAL_FILL' | 'FADING_OUT' | 'CYCLING'>(
    'INITIAL_FILL'
  )

  const taskQueue = useMemo(
    () =>
      shuffleArray(ALL_POSSIBLE_TASKS).map((task) => ({
        ...task,
        key: nanoid(),
      })),
    []
  )

  const indexRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const cleanup = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    if (phase === 'INITIAL_FILL') {
      const addTaskSequentially = (taskIndex: number) => {
        if (taskIndex >= MAX_TASKS_VISIBLE) {
          timerRef.current = setTimeout(() => {
            setPhase('FADING_OUT')
          }, 2000)
          return
        }

        const delay = Math.random() * 1500 + 800
        timerRef.current = setTimeout(() => {
          setTasks((prevTasks) => {
            const newTask = taskQueue[taskIndex]
            indexRef.current = taskIndex + 1
            return [...prevTasks, newTask]
          })
          addTaskSequentially(taskIndex + 1)
        }, delay)
      }

      addTaskSequentially(0)
    }

    if (phase === 'FADING_OUT') {
      setTasks((prevTasks) => prevTasks.map((t) => ({ ...t, isExiting: true })))

      timerRef.current = setTimeout(() => {
        setPhase('CYCLING')
        setTasks([])
      }, 800)
    }

    if (phase === 'CYCLING') {
      const scheduleNextTask = () => {
        const delay = Math.random() * 3000 + 2000
        timerRef.current = setTimeout(() => {
          setTasks((prevTasks) => {
            const nextTaskToAdd = taskQueue[indexRef.current]
            indexRef.current = (indexRef.current + 1) % taskQueue.length

            const updatedTasks = [...prevTasks, nextTaskToAdd]
            if (updatedTasks.length > MAX_TASKS_VISIBLE) {
              return updatedTasks.slice(1)
            }
            return updatedTasks
          })
          scheduleNextTask()
        }, delay)
      }
      scheduleNextTask()
    }

    return cleanup
  }, [phase, taskQueue])

  return (
    <Message from="assistant">
      <MessageContent>
        <Task className="w-full">
          <TaskTrigger title="Generating Project..." />
          <TaskContent>
            {tasks.map((task) => (
              <TaskItem key={task.key} data-exiting={task.isExiting}>
                {task.value}
              </TaskItem>
            ))}
          </TaskContent>
        </Task>
      </MessageContent>
    </Message>
  )
}
