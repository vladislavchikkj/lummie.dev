'use client'

import { Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactView() {
	return (
		<div className='bg-background text-foreground antialiased'>
			<div className='container mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36'>
				<header className='text-center max-w-3xl mx-auto'>
					<h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground'>
						Get in Touch
					</h1>
					<p className='mt-6 text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground'>
						Have a question, a project proposal, or just want to say hello? We’d
						love to hear from you. Fill out the form below or email us directly.
					</p>
				</header>

				<main className='mt-10 sm:mt-24 max-w-4xl mx-auto'>
					<div className='bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/20'>
						<div className='grid md:grid-cols-2'>
							<div className='p-10 md:p-12 border-b md:border-b-0 md:border-r'>
								<h2 className='text-2xl font-bold text-card-foreground'>
									Contact Information
								</h2>
								<p className='mt-3 text-muted-foreground'>
									Find the right contact for your inquiry.
								</p>
								<div className='mt-10 space-y-8'>
									<div className='flex items-start gap-4'>
										<div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted'>
											<Mail className='h-6 w-6 text-muted-foreground' />
										</div>
										<div>
											<h3 className='font-semibold text-card-foreground text-lg'>
												Sales Inquiries
											</h3>
											<p className='mt-1 text-sm text-muted-foreground'>
												For pricing, plans, and partnerships.
											</p>
											<a
												href='mailto:sales@lummie.dev'
												className='mt-2 inline-block text-sm font-medium text-foreground transition-colors hover:text-muted-foreground'
											>
												sales@lummie.dev
											</a>
										</div>
									</div>
									<div className='flex items-start gap-4'>
										<div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted'>
											<MessageSquare className='h-6 w-6 text-muted-foreground' />
										</div>
										<div>
											<h3 className='font-semibold text-card-foreground text-lg'>
												General & Support
											</h3>
											<p className='mt-1 text-sm text-muted-foreground'>
												For technical help and other questions.
											</p>
											<a
												href='mailto:support@lummie.dev'
												className='mt-2 inline-block text-sm font-medium text-foreground transition-colors hover:text-muted-foreground'
											>
												support@lummie.dev
											</a>
										</div>
									</div>
								</div>
							</div>

							<div className='p-10 md:p-12'>
								<h2 className='text-2xl font-bold text-card-foreground'>
									Send a Message
								</h2>
								<form
									className='mt-8 space-y-6'
									onSubmit={e => e.preventDefault()}
								>
									<div>
										<Label className='py-2' htmlFor='name'>
											Full Name
										</Label>
										<Input
											id='name'
											type='text'
											placeholder='John Doe'
											required
										/>
									</div>
									<div>
										<Label className='py-2' htmlFor='email'>
											Work Email
										</Label>
										<Input
											id='email'
											type='email'
											placeholder='you@company.com'
											required
										/>
									</div>
									<div>
										<Label className='py-2' htmlFor='message'>
											Message
										</Label>
										<Textarea
											id='message'
											placeholder='How can we help you today?'
											required
											rows={5}
										/>
									</div>

									<Button
										type='submit'
										className='w-full py-3 font-semibold transition-transform active:scale-[0.98]'
									>
										Send Message
									</Button>
								</form>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
