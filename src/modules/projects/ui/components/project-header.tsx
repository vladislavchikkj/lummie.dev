import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

import Logo from '@/components/ui/logo'
import { useTRPC } from '@/trpc/client'
import { useSidebar } from '@/components/ui/sidebar'

interface Props {
  projectId: string
}

export const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC()
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  )

  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      onClick={toggleSidebar}
      className="px-0! py-0! hover:bg-transparent!"
    >
      <Logo width={28} height={28} />
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
}
