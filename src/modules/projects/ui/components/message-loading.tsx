import { APP_NAME } from '@/app/constants'
import Logo from '@/components/ui/logo'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const ShimmerMessages = () => {
	const messages = [
		'Thinking...',
		'Loading...',
		'Generating...',
		'Analyzing your request...',
		'Building your website...',
		'Crafting components...',
		'Optimizing layout...',
		'Adding final touches...',
		'Almost ready...',
	]

	const [currentMessage, setCurrentMessage] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentMessage(prev => (prev + 1) % messages.length)
		}, 2000)

		return () => clearInterval(interval)
	}, [messages.length])

	return (
		<div className='flex items-center gap-2'>
			<span className='text-base text-muted-foreground animate-pulse'>
				{messages[currentMessage]}
			</span>
		</div>
	)
}

export const MessageLoading = () => {
	return (
		<div className='flex flex-col px-2 pb-4'>
			<div className='flex items-center gap-2 pl-2 mb-2'>
				<Logo width={20} height={20} className='shrink-0' />
				<span className='text-sm font-medium'>{APP_NAME}</span>
			</div>
			<div className='pl-8.5 flex flex-col gap-y-4'>
				<ShimmerMessages />
			</div>
		</div>
	)
}
