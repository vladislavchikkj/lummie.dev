import {
  Copy,
  ExternalLinkIcon,
  RefreshCcwIcon,
  CodeIcon,
  EyeIcon,
  XIcon,
  ArrowLeft,
} from 'lucide-react'
import { Fragment } from '@/generated/prisma'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/hint'
import { Separator } from '@/components/ui/separator'
import { TabState } from '../../constants/chat'
import { cn } from '@/lib/utils'

interface FragmentPanelHeaderProps {
  activeFragment: Fragment
  tabState: TabState
  copied: boolean
  onTabChange: (value: TabState) => void
  onRefreshPreview: () => void
  onCopyUrl: () => void
  onClose: () => void
  isMobile?: boolean
}

export const FragmentPanelHeader = ({
  activeFragment,
  tabState,
  copied,
  onTabChange,
  onRefreshPreview,
  onCopyUrl,
  onClose,
  isMobile = false,
}: FragmentPanelHeaderProps) => {
  return (
    <div
      className={cn(
        'flex h-14 flex-none items-center justify-between gap-x-2 px-2',
        isMobile
          ? 'bg-background/95 border-b backdrop-blur-xl'
          : 'rounded-tl-lg border-t border-b border-l'
      )}
    >
      {isMobile ? (
        <>
          <div className="flex items-center gap-2">
            <Hint text="Back to chat" side="bottom">
              <Button size="icon" variant="ghost" onClick={onClose}>
                <ArrowLeft className="size-4" />
              </Button>
            </Hint>
            <TabsList className="h-9 rounded-md border bg-transparent p-1">
              <TabsTrigger value="preview" className="h-full text-sm">
                <EyeIcon className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="code" className="h-full text-sm">
                <CodeIcon className="size-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          {tabState === 'preview' && (
            <div className="flex items-center gap-2">
              <Hint text="Refresh Preview" side="bottom">
                <Button size="icon" variant="ghost" onClick={onRefreshPreview}>
                  <RefreshCcwIcon className="size-4" />
                </Button>
              </Hint>
              <Hint text={copied ? 'Copied!' : 'Copy URL'} side="bottom">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onCopyUrl}
                  disabled={!activeFragment.sandboxUrl}
                >
                  <Copy className="size-4" />
                </Button>
              </Hint>
              <Hint text="Open in a new tab" side="bottom">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!activeFragment.sandboxUrl}
                  asChild
                >
                  <a
                    href={activeFragment.sandboxUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="size-4" />
                  </a>
                </Button>
              </Hint>
            </div>
          )}
        </>
      ) : (
        <>
          <TabsList className="h-9 rounded-md border bg-transparent p-1">
            <TabsTrigger value="preview" className="h-full text-sm">
              <EyeIcon className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="code" className="h-full text-sm">
              <CodeIcon className="size-4" />
            </TabsTrigger>
          </TabsList>

          {tabState === 'preview' && (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-x-2">
              <div className="group bg-muted/60 relative flex h-9 flex-1 items-center gap-2 rounded-md border">
                <Hint text="Refresh Preview" side="bottom">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onRefreshPreview}
                  >
                    <RefreshCcwIcon className="size-4" />
                  </Button>
                </Hint>
                <span className="text-muted-foreground truncate font-mono text-sm">
                  {activeFragment.sandboxUrl ?? 'URL not available'}
                </span>
                <Hint text={copied ? 'Copied!' : 'Copy URL'} side="bottom">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2"
                    onClick={onCopyUrl}
                    disabled={!activeFragment.sandboxUrl}
                  >
                    <Copy className="size-4" />
                  </Button>
                </Hint>
              </div>

              <Hint text="Open in a new tab" side="bottom">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!activeFragment.sandboxUrl}
                  asChild
                >
                  <a
                    href={activeFragment.sandboxUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="size-4" />
                  </a>
                </Button>
              </Hint>
            </div>
          )}

          <div className="flex h-full w-fit items-center justify-center gap-2">
            <Separator orientation="vertical" className="h-6" />

            <Hint text="Close Panel" side="bottom">
              <Button size="icon" variant="ghost" onClick={onClose}>
                <XIcon className="size-4" />
              </Button>
            </Hint>
          </div>
        </>
      )}
    </div>
  )
}
