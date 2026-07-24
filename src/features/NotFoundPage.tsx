import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-pru-red">404</p>
      <div>
        <h1 className="text-xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Kembali ke Home</Link>
      </Button>
    </div>
  )
}
