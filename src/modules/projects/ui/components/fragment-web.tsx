'use client'

import { useState, useEffect } from 'react'
import { Loader2, Slash } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Fragment } from '@/generated/prisma'

const LoadingOverlay = () => (
  <div className="bg-background/80 absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
  </div>
)

const ErrorState = () => (
  <div className="bg-muted/30 text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-4 text-sm">
    <div className="flex items-center gap-2">
      <Slash className="h-4 w-4" />
      <span>URL для предпросмотра не найден.</span>
    </div>
  </div>
)

interface FragmentWebProps {
  data: Fragment
  refreshKey: number
}

export function FragmentWeb({ data, refreshKey }: FragmentWebProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [data.sandboxUrl, refreshKey])

  if (!data.sandboxUrl) {
    return <ErrorState />
  }

  return (
    <div className="bg-background relative h-full w-full overflow-hidden">
      {isLoading && <LoadingOverlay />}

      <iframe
        key={`${data.id}-${refreshKey}`}
        className={cn(
          'h-full w-full border-0 transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        src={data.sandboxUrl}
        title="Fragment Preview"
        sandbox="allow-forms allow-scripts allow-same-origin"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
