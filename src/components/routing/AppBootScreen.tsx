import { Loader2Icon } from 'lucide-react'
import { Brand } from '@/components/layout/Brand'

export const AppBootScreen = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Brand />
      <Loader2Icon className="size-6 animate-spin text-pru-red" />
      <p className="text-sm text-muted-foreground">Memuat sesi...</p>
    </div>
  )
}
