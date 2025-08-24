import { ProjectForm } from '@/modules/home/ui/components/project-form'
import { APP_DESCRIPTION, APP_NAME } from '../constants'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { ProjectsList } from '@/modules/home/ui/components/projects-list'
import Logo from '@/components/ui/logo'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'

const Page = () => {
	return (
		<section>
			<BackgroundRippleEffect />
			<div className='flex flex-col items-center max-w-5xl mx-auto w-full px-5'>
				<Logo width={75} height={75} className='relative z-10 mb-2 ' />
				<h2 className='relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-6xl dark:text-neutral-100'>
					{APP_NAME}
				</h2>
				<div className='relative z-10 mx-auto mt-4 mb-8 max-w-xl text-center text-neutral-800 dark:text-neutral-500'>
					<TextGenerateEffect words={APP_DESCRIPTION} />
				</div>
				<div className='relative z-10 max-w-3xl mx-auto w-full'>
					<ProjectForm />
				</div>
				<div className='relative z-10 max-w-5xl mx-auto w-full my-15 mt-35'>
					<ProjectsList />
				</div>
			</div>
		</section>
	)
}

export default Page
