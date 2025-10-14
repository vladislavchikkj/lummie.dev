'use client'

import { FC } from 'react'
import { Button } from '@/components/ui/button'

const CookieManager: FC = () => {
  return (
    <div className={'flex justify-center'}>
      <Button
        variant="default"
        size="lg"
        onClick={() => {
          const event = new CustomEvent('open-cookie-banner')
          document.dispatchEvent(event)
        }}
      >
        Manage Cookies Preferences
      </Button>
    </div>
  )
}

export default CookieManager
