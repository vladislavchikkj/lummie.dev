import Link from 'next/link'
import { motion } from 'framer-motion'
import Logo from '@/components/ui/logo'

export const LogoLink = () => (
	<Link href='/' className='flex items-center gap-2 flex-shrink-0'>
		<motion.div
			whileHover={{ scale: 1.1, rotate: 5 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Logo width={28} height={28} />
		</motion.div>
		<span className='font-bold text-xl tracking-tight'>Lummie</span>
	</Link>
)
