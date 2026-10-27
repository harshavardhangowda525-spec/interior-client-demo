/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        alt?: string
        poster?: string
        loading?: 'auto' | 'lazy' | 'eager'
        reveal?: 'auto' | 'manual'
        'camera-orbit'?: string
        'field-of-view'?: string
        'environment-image'?: string
        exposure?: string
        'shadow-intensity'?: string
        'shadow-softness'?: string
        'interaction-prompt'?: string
        'disable-zoom'?: boolean
        'disable-tap'?: boolean
        'tone-mapping'?: string
      }
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_CONTACT_PHONE?: string
  readonly VITE_INSTAGRAM_URL?: string
  readonly VITE_ENQUIRY_ENDPOINT?: string
}
