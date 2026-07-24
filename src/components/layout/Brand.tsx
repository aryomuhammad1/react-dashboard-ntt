import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
}

export const Brand = ({ className }: BrandProps) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded bg-pru-red text-base font-bold text-white">
        P
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-tight">Prudential</span>
        <span className="text-xs text-muted-foreground">Product Dashboard</span>
      </span>
    </div>
  )
}
