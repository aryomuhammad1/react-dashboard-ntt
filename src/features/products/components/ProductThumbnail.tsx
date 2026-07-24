import { cn } from '@/lib/utils'

interface ProductThumbnailProps {
  src: string
  alt: string
  className?: string
}

export const ProductThumbnail = ({ src, alt, className }: ProductThumbnailProps) => {
  if (!src) {
    return (
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded border bg-muted text-sm font-bold text-muted-foreground',
          className,
        )}
      >
        {alt.charAt(0).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('size-11 shrink-0 rounded border bg-card object-contain', className)}
    />
  )
}
