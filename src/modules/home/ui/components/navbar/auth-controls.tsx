import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { SheetClose } from '@/components/ui/sheet'

interface AuthControlsProps {
  mobile?: boolean
}

export const AuthControls = ({ mobile }: AuthControlsProps) => (
  <div className={mobile ? 'flex flex-col gap-4' : 'flex items-center gap-3'}>
    <SignUpButton>
      {mobile ? (
        <SheetClose asChild>
          <Button variant="outline" className="w-full">
            Sign up
          </Button>
        </SheetClose>
      ) : (
        <Button variant="outline" size="sm" className="hover:bg-primary/10">
          Sign up
        </Button>
      )}
    </SignUpButton>
    <SignInButton>
      {mobile ? (
        <SheetClose asChild>
          <Button className="from-primary to-primary/80 w-full bg-gradient-to-r">
            Sign in
          </Button>
        </SheetClose>
      ) : (
        <Button
          size="sm"
          className="from-primary to-primary/80 hover:from-primary/90 bg-gradient-to-r"
        >
          Sign in
        </Button>
      )}
    </SignInButton>
  </div>
)
