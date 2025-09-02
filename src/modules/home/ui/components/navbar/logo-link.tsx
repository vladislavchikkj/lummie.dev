import Link from 'next/link'
import { motion } from 'framer-motion'
import Logo from '@/components/ui/logo'

export const LogoLink = () => (
  <Link href="/" className="flex flex-shrink-0 items-center gap-2">
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Logo width={28} height={28} />
    </motion.div>
    <span className="text-xl font-bold tracking-tight">Lummie</span>
  </Link>
)
