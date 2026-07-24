import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/routing/PublicOnlyRoute'
import { Toaster } from '@/components/ui/sonner'
import { LoginPage } from '@/features/auth/LoginPage'
import { HomePage } from '@/features/home/HomePage'
import { NotFoundPage } from '@/features/NotFoundPage'
import { ProductCreatePage } from '@/features/products/ProductCreatePage'
import { ProductDetailPage } from '@/features/products/ProductDetailPage'
import { ProductEditPage } from '@/features/products/ProductEditPage'
import { ProductListPage } from '@/features/products/ProductListPage'
import { useAuthStore } from '@/stores/authStore'

const App = () => {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductCreatePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </HashRouter>
  )
}

export default App
