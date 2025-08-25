'use client'

import { PricingTable } from '@clerk/nextjs'
import Logo from '@/components/ui/logo'
import { dark } from '@clerk/themes'
import { useCurrentTheme } from '@/hooks/use-current-theme'

const Page = () => {
	const currentTheme = useCurrentTheme()

	return (
		<div className='flex flex-col max-w-3xl mx-auto w-full'>
			<section className='space-y-6'>
				<div className='flex flex-col items-center'>
					<Logo width={50} height={30} className='hidden md:block' />
				</div>
				<h1 className='text-xl md:text-3xl font-bold text-center'>Pricing</h1>
				<p className='text-muted-foreground text-center text-sm md:text-base'>
					Choose the plan that works best for you
				</p>
				<PricingTable
					appearance={{
						baseTheme: currentTheme === 'dark' ? dark : undefined,
						elements: {
							pricingTableCard: 'border! shadow-none! rounded-lg!',
						},
					}}
				/>
			</section>
		</div>
	)
}

export default Page
