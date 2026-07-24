import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCategory } from '@/lib/format'
import type { ProductFormValues } from '@/types'

const productSchema = z.object({
  title: z.string().trim().min(3, 'Nama produk minimal 3 karakter.'),
  description: z.string().trim().min(10, 'Deskripsi minimal 10 karakter.'),
  category: z.string().min(1, 'Kategori wajib dipilih.'),
  price: z
    .string()
    .min(1, 'Harga wajib diisi.')
    .refine((value) => Number(value) > 0, 'Harga harus berupa angka lebih dari 0.'),
  discountPercentage: z
    .string()
    .refine(
      (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
      'Diskon harus antara 0 sampai 100.',
    ),
  stock: z
    .string()
    .min(1, 'Stok wajib diisi.')
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
      'Stok harus bilangan bulat 0 atau lebih.',
    ),
  brand: z.string().trim(),
})

type ProductSchema = z.infer<typeof productSchema>

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialValues?: ProductFormValues
  categories: string[]
  isSubmitting: boolean
  onSubmit: (values: ProductFormValues) => void
  onCancel: () => void
}

export const ProductForm = ({
  mode,
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category ?? '',
      price: initialValues ? String(initialValues.price) : '',
      discountPercentage: initialValues ? String(initialValues.discountPercentage) : '0',
      stock: initialValues ? String(initialValues.stock) : '',
      brand: initialValues?.brand ?? '',
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      price: Number(values.price),
      discountPercentage: Number(values.discountPercentage || 0),
      stock: Number(values.stock),
      brand: values.brand.trim(),
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Produk</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Wireless Headphone Pro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Jelaskan keunggulan produk ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {formatCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Apple" {...field} />
                </FormControl>
                <FormDescription>Opsional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (USD)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diskon (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 border-t pt-5">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {mode === 'create' ? 'Simpan Produk' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
