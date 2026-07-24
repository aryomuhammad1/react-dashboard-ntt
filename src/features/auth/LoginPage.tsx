import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, Loader2Icon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Brand } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

const DEMO_USERNAME = 'emilys'
const DEMO_PASSWORD = 'emilyspass'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})

type LoginSchema = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const serverError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    clearError()
    const isSuccess = await login(values.username, values.password)
    if (!isSuccess) return

    toast.success('Berhasil masuk. Selamat datang kembali!')
    const redirect = searchParams.get('redirect')
    navigate(redirect ? decodeURIComponent(redirect) : '/', { replace: true })
  })

  const fillDemoAccount = () => {
    form.setValue('username', DEMO_USERNAME)
    form.setValue('password', DEMO_PASSWORD)
    form.clearErrors()
    clearError()
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-pru-red p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded bg-white text-base font-bold text-pru-red">
            P
          </span>
          <span className="text-sm font-bold tracking-tight">Prudential</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl leading-tight font-bold">Product Dashboard</h1>
        </div>

        <p className="text-xs text-white/60">Dibuat menggunakan React 19, TypeScript, dan Zustand.</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Masuk ke akun Anda</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gunakan akun demo DummyJSON untuk mencoba aplikasi ini.
          </p>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-md border border-pru-red-200 bg-pru-red-50 px-3.5 py-3"
                >
                  <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-pru-red" />
                  <p className="text-sm text-pru-red-dark">{serverError}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        placeholder="Masukkan username"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={isPasswordVisible ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Masukkan password"
                          className="h-10 pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        aria-label={isPasswordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                        className="absolute top-1/2 right-1 -translate-y-1/2"
                      >
                        {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 w-full">
                {isSubmitting && <Loader2Icon className="animate-spin" />}
                Masuk
              </Button>
            </form>
          </Form>

          <div className="mt-6 rounded-md border bg-card p-4">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Akun Demo</p>
            <p className="mt-1.5 font-mono text-sm">
              {DEMO_USERNAME} / {DEMO_PASSWORD}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fillDemoAccount}>
              Isi Otomatis
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
