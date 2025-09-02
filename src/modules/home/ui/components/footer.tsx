'use client'

import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

const footerLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

const socialLinks = [
  {
    href: 'https://github.com/vladislavchikkj/lummie.dev',
    label: 'GitHub',
    icon: Github,
  },
  {
    href: 'https://twitter.com',
    label: 'Twitter',
    icon: Twitter,
  },
  {
    href: 'https://www.linkedin.com/company/lcloud-inc/?viewAsMember=true',
    label: 'LinkedIn',
    icon: Linkedin,
  },
]

export const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 py-12 lg:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Logo width={28} height={28} />
              <span className="text-foreground text-lg font-bold">Lummie</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your smart assistant for creating amazing content. Boost your
              productivity with AI.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-8 gap-y-4"
            aria-label="Footer Navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t py-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Lummie. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
