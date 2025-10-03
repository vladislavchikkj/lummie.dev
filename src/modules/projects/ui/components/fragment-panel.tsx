import { FileCode2 } from 'lucide-react'
import { Fragment } from '@/generated/prisma'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { FragmentWeb } from './fragment-web'
import { FileExplorer } from '@/components/file-explorer/file-explorer'
import { FragmentPanelHeader } from './fragment-panel-header'
import { TabState } from '../../constants/chat'

interface FragmentPanelProps {
  activeFragment: Fragment
  tabState: TabState
  fragmentKey: number
  projectId: string
  copied: boolean
  onTabChange: (value: TabState) => void
  onRefreshPreview: () => void
  onCopyUrl: () => void
  onClose: () => void
}

const CodePlaceholder = () => (
  <div className="bg-muted/40 text-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed">
    <FileCode2 size={48} strokeWidth={1} />
    <p className="mt-4 text-center text-lg font-medium">No code to display</p>
    <p className="text-sm">Select a fragment to browse its files.</p>
  </div>
)

export const FragmentPanel = ({
  activeFragment,
  tabState,
  fragmentKey,
  projectId,
  copied,
  onTabChange,
  onRefreshPreview,
  onCopyUrl,
  onClose,
}: FragmentPanelProps) => {
  return (
    <Tabs
      className="flex h-full flex-col gap-0"
      defaultValue="preview"
      value={tabState}
      onValueChange={(value) => onTabChange(value as TabState)}
    >
      <FragmentPanelHeader
        activeFragment={activeFragment}
        tabState={tabState}
        copied={copied}
        onTabChange={onTabChange}
        onRefreshPreview={onRefreshPreview}
        onCopyUrl={onCopyUrl}
        onClose={onClose}
      />

      <TabsContent value="preview" className="flex-1 overflow-auto border-l">
        <FragmentWeb data={activeFragment} refreshKey={fragmentKey} />
      </TabsContent>

      <TabsContent value="code" className="flex-1 overflow-auto border-l">
        {activeFragment.files ? (
          <FileExplorer
            files={activeFragment.files as { [path: string]: string }}
            projectId={projectId}
          />
        ) : (
          <div className="h-full p-4">
            <CodePlaceholder />
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
