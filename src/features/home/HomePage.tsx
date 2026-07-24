import { PackageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'

export const HomePage = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-5 bg-pru-red-50 px-6 py-7">
        <div>
          <p className="text-sm font-semibold text-pru-red-dark">Selamat datang kembali,</p>
          {user ? (
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
          ) : (
            <Skeleton className="mt-2 h-8 w-56" />
          )}
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Kelola katalog produk Anda: cari, urutkan, tambah, ubah, dan hapus produk.
          </p>
        </div>

        <Button asChild>
          <Link to="/products">
            <PackageIcon />
            Lihat Produk
          </Link>
        </Button>
      </div>
    </Card>
  )
}
