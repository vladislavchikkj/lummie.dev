'use client'

import { useState, useEffect, type FC } from 'react'
import { getCookie, setCookie } from 'cookies-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type CookieConsentState = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_NAME = 'cookie_consent'

const CookieConsent: FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  const [consent, setConsent] = useState<CookieConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consentCookie = getCookie(COOKIE_NAME)
    if (!consentCookie) {
      setShowBanner(true)
    } else {
      setConsent(JSON.parse(consentCookie as string))
    }
  }, [])

  useEffect(() => {
    const handler = () => setShowBanner(true)
    document.addEventListener('open-cookie-banner', handler)
    return () => document.removeEventListener('open-cookie-banner', handler)
  }, [])

  const handleAcceptAll = () => {
    const newConsent = { necessary: true, analytics: true, marketing: true }
    setConsent(newConsent)
    setCookie(COOKIE_NAME, JSON.stringify(newConsent), {
      maxAge: 60 * 60 * 24 * 365,
    })
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const newConsent = { necessary: true, analytics: false, marketing: false }
    setConsent(newConsent)
    setCookie(COOKIE_NAME, JSON.stringify(newConsent), {
      maxAge: 60 * 60 * 24 * 365,
    })
    setShowBanner(false)
  }

  const handleSaveSettings = () => {
    const newConsent = { ...consent, necessary: true }
    setConsent(newConsent)
    setCookie(COOKIE_NAME, JSON.stringify(newConsent), {
      maxAge: 60 * 60 * 24 * 365,
    })
    setShowBanner(false)
    setShowSettings(false)
  }

  const toggleConsent = (type: keyof Omit<CookieConsentState, 'necessary'>) => {
    setConsent((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 p-4">
        <div className="bg-background/95 mx-auto max-w-4xl rounded-lg border p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-foreground text-sm">
              We use cookies to enhance your browser experience, serve
              personalized ads or content, and analyze our traffic. By clicking
              &quot;Accept All&quot;, you consent to our use of cookies.
              <Link href="/privacy" className="ml-1 underline">
                Read our Privacy Policy.
              </Link>
            </p>
            <div className="flex shrink-0 gap-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                Reject All
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which types of cookies you want to enable. You can change
              these settings at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="necessary" className="font-medium">
                  Necessary Cookies
                </Label>
                <p className="text-muted-foreground text-xs">
                  These cookies are essential for the website to function
                  properly.
                </p>
              </div>
              <Switch id="necessary" checked disabled />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="analytics" className="font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-muted-foreground text-xs">
                  These cookies help us understand how you use our website.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={consent.analytics}
                onCheckedChange={() => toggleConsent('analytics')}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="marketing" className="font-medium">
                  Marketing Cookies
                </Label>
                <p className="text-muted-foreground text-xs">
                  These cookies are used to deliver advertisements more relevant
                  to you.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={consent.marketing}
                onCheckedChange={() => toggleConsent('marketing')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button onClick={handleSaveSettings}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CookieConsent
