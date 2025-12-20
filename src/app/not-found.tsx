import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <main className="flex flex-1 flex-col items-center justify-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold tracking-tighter md:text-9xl">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md text-base md:text-lg">
            {/* New Joke */}
            Looks like this page went on a vacation. We&apos;ve sent a search
            party of ones and zeros to bring it back.
          </p>
        </div>

        <Button asChild size="lg" variant="outline">
          <Link href="/">Return to Home</Link>
        </Button>
      </main>

      <footer className="text-muted-foreground py-8 text-sm">
        <a
          href="https://lummie.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          lummie.app
        </a>
      </footer>
    </div>
  )
}
