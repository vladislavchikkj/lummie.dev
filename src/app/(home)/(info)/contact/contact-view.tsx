'use client'

import { Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactView() {
  return (
    <div className="bg-background text-foreground antialiased">
      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Get in Touch
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
            Have a question, a project proposal, or just want to say hello? We’d
            love to hear from you. Fill out the form below or email us directly.
          </p>
        </header>

        <main className="mx-auto mt-10 max-w-4xl sm:mt-24">
          <div className="bg-card hover:border-primary/20 overflow-hidden rounded-2xl border transition-all duration-300">
            <div className="grid md:grid-cols-2">
              <div className="border-b p-10 md:border-r md:border-b-0 md:p-12">
                <h2 className="text-card-foreground text-2xl font-bold">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mt-3">
                  Find the right contact for your inquiry.
                </p>
                <div className="mt-10 space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                      <Mail className="text-muted-foreground h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-card-foreground text-lg font-semibold">
                        Sales Inquiries
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        For pricing, plans, and partnerships.
                      </p>
                      <a
                        href="mailto:sales@lummie.app"
                        className="text-foreground hover:text-muted-foreground mt-2 inline-block text-sm font-medium transition-colors"
                      >
                        sales@lummie.app
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                      <MessageSquare className="text-muted-foreground h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-card-foreground text-lg font-semibold">
                        General & Support
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        For technical help and other questions.
                      </p>
                      <a
                        href="mailto:support@lummie.app"
                        className="text-foreground hover:text-muted-foreground mt-2 inline-block text-sm font-medium transition-colors"
                      >
                        support@lummie.app
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 md:p-12">
                <h2 className="text-card-foreground text-2xl font-bold">
                  Send a Message
                </h2>
                <form
                  className="mt-8 space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <Label className="py-2" htmlFor="name">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label className="py-2" htmlFor="email">
                      Work Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div>
                    <Label className="py-2" htmlFor="message">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you today?"
                      required
                      rows={5}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 font-semibold transition-transform active:scale-[0.98]"
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
