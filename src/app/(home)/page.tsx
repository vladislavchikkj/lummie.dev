import { ProjectForm } from '@/modules/home/ui/components/project-form'
import { APP_DESCRIPTION, APP_NAME } from '../constants'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { ProjectsList } from '@/modules/home/ui/components/projects-list'
import Logo from '@/components/ui/logo'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'

const Page = () => {
  return (
    <section className="mt-40">
      <BackgroundRippleEffect />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-5">
        <Logo width={75} height={75} className="relative z-10 mb-2" />
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-6xl dark:text-neutral-100">
          {APP_NAME}
        </h2>
        <div className="relative z-10 mx-auto mt-4 mb-8 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
          <TextGenerateEffect words={APP_DESCRIPTION} />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <ProjectForm />
        </div>
        <div className="relative z-10 mx-auto my-15 mt-50 w-full max-w-7xl">
          <ProjectsList />
        </div>
      </div>
    </section>
  )
}

export default Page
