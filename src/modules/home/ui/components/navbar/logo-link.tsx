import Link from 'next/link'
import Logo from '@/components/ui/logo'

export const LogoLink = () => (
  <Link href="/" className="flex flex-shrink-0 items-end gap-2">
    <div>
      <Logo width={28} height={28} />
    </div>
  </Link>
)
