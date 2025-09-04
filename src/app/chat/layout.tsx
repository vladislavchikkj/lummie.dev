import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Home, Hash } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/ui/logo'

interface Props {
  children: React.ReactNode
}

const items = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'New Chat', href: '/chat', icon: Hash },
]

const Layout = ({ children }: Props) => {
  return (
    <main className="flex min-h-screen flex-col">
      <main className="flex flex-1">
        <SidebarProvider>
          {/*TODO change with ChatSideBar */}
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="mb-5">
                  <Link href="/" className="flex items-center gap-2">
                    <Logo width={24} height={24} />
                    <span className="text-lg font-semibold">Lummie.ai</span>
                  </Link>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      // eslint-disable-next-line react/jsx-no-undef
                      <SidebarMenuItem key={item.title}>
                        {/* eslint-disable-next-line react/jsx-no-undef */}
                        <SidebarMenuButton asChild>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarTrigger />
          {children}
        </SidebarProvider>
      </main>
    </main>
  )
}

export default Layout
