import {
  Search,
  Folder,
  Clock,
  LayoutGrid,
  Globe,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const mainNavItems = [
  { title: 'Search', icon: Search },
  { title: 'Projects', icon: Folder },
  { title: 'Recent Chats', icon: Clock },
  { title: 'Design Systems', icon: LayoutGrid },
  { title: 'Community', icon: Globe },
]

const recentChats = [
  { title: 'Hello', active: true },
  { title: 'Hello there', active: false },
  { title: 'Update footer component', active: false },
  { title: 'Open in v0', active: true },
  { title: 'Parallax landing page', active: false },
  { title: 'Next.js 404 page', active: false },
  { title: 'Shadcn ui documentation', active: false },
  { title: 'resizable-demo', active: false },
  { title: 'Mathjax formula formatting', active: false },
  { title: 'Screen Switcher', active: false },
  { title: 'GPT Model Used', active: false },
  { title: 'GPT Model', active: false },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="p-2">
        <button className="flex w-full items-center justify-center rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
          New Chat
        </button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-between">
                  <span>Favorites</span>
                  <ChevronRight className="h-4 w-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-3">
            <span>Recent Chats</span>
            <ChevronDown className="h-4 w-4" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentChats.map((chat) => (
                <SidebarMenuItem key={chat.title}>
                  <SidebarMenuButton
                    className={`w-full justify-between ${chat.active ? 'bg-neutral-800 hover:bg-neutral-700' : ''}`}
                  >
                    <span className="truncate">{chat.title}</span>
                    <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
