'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, BookOpen, PenTool, Users, Sparkles } from 'lucide-react'

type NavItem = { href: string; label: string }

interface DesktopNavProps {
  pathname: string
  navItems: NavItem[]
}

export const DesktopNav = ({ pathname, navItems }: DesktopNavProps) => (
  <nav className="hidden items-center gap-2 md:flex">
    {navItems.map((item) =>
      item.label === 'Resources' ? (
        <DropdownMenu key={item.href}>
          <DropdownMenuTrigger
            className={cn(
              'relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            {item.label}
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border-border/50 mt-2 w-64 rounded-xl border p-2 shadow-2xl">
            <div className="p-2">
              <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold tracking-wider uppercase">
                Learn
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href="/resources/docs"
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/resources/guides"
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <PenTool className="h-4 w-4" />
                  Guides & Tutorials
                </Link>
              </DropdownMenuItem>
            </div>
            <div className="p-2">
              <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold tracking-wider uppercase">
                Community
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href="/resources/blog"
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/resources/community"
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Community Resources
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === item.href
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-primary'
          )}
        >
          {item.label}
          {pathname === item.href && (
            <motion.div
              className="bg-primary absolute right-0 -bottom-1 left-0 h-0.5"
              layoutId="underline"
              transition={{ type: 'spring', stiffness: 300 }}
            />
          )}
        </Link>
      )
    )}
  </nav>
)
