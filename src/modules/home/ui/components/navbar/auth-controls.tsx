import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SheetClose } from '@/components/ui/sheet'

interface AuthControlsProps {
  mobile?: boolean
}

export const AuthControls = ({ mobile }: AuthControlsProps) => (
  <div className={mobile ? 'flex flex-col gap-4' : 'flex items-center gap-3'}>
    {mobile ? (
      <>
        <SheetClose asChild>
          <Link href="/sign-up">
            <Button variant="outline" className="w-full">
              Sign up
            </Button>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link href="/sign-in">
            <Button className="from-primary to-primary/80 w-full bg-gradient-to-r">
              Sign in
            </Button>
          </Link>
        </SheetClose>
      </>
    ) : (
      <>
        <Link href="/sign-up">
          <Button variant="outline" size="sm" className="hover:bg-primary/10">
            Sign up
          </Button>
        </Link>
        <Link href="/sign-in">
          <Button
            size="sm"
            className="from-primary to-primary/80 hover:from-primary/90 bg-gradient-to-r"
          >
            Sign in
          </Button>
        </Link>
      </>
    )}
  </div>
)
