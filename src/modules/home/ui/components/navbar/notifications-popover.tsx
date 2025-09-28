import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

export const NotificationsPopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent relative rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
        </div>
        <div className="flex h-[200px] flex-col items-center justify-center p-4 text-center">
          {/* В будущем тут будут уведомления приложения */}
          <div className="text-muted-foreground">
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="mt-1 text-xs">
              When you have new notifications, they will appear here.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
