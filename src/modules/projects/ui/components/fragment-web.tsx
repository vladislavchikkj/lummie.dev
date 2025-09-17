import { Fragment } from '@/generated/prisma'

interface Props {
  data: Fragment
  refreshKey: number
}

export function FragmentWeb({ data, refreshKey }: Props) {
  return (
    <div className="h-full w-full overflow-hidden">
      <iframe
        key={refreshKey}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
        title="Fragment Preview"
      />
    </div>
  )
}
