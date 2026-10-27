import type { ImgHTMLAttributes } from 'react'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  /** Base name in /public/images (WebP), e.g. "proj-ivory". */
  name: string
  alt: string
  /** Hint for the browser's srcset choice. */
  sizes?: string
  priority?: boolean
  /** Natural size of the large variant, used to reserve layout space. */
  w?: number
  h?: number
}

/** Responsive WebP image with a 640px variant for small screens. */
export function Img({ name, alt, sizes = '100vw', priority, w = 1024, h = 576, ...rest }: Props) {
  return (
    <img
      src={`/images/${name}.webp`}
      srcSet={`/images/${name}-sm.webp 640w, /images/${name}.webp ${w}w`}
      sizes={sizes}
      alt={alt}
      width={w}
      height={h}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      {...rest}
    />
  )
}
