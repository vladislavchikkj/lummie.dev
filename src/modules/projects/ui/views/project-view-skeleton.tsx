import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/modules/home/ui/components/navbar/navbar'

const MessageSkeleton = () => (
  <div className="flex items-start space-x-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
)

export const ProjectViewSkeleton = () => {
  return (
    <div className="flex h-dvh flex-col pt-14">
      <Navbar showDesktopNav={false} applyScrollStyles={false} />

      <div className="flex-1">
        <div className="flex h-full flex-col p-4">
          <div className="flex-1 space-y-6 overflow-hidden">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </div>

          <div className="mt-auto pt-4">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
