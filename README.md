# Prudential Product Dashboard

Mini dashboard untuk mengelola data produk. Dibangun menggunakan React 19 dan TypeScript, dengan REST API publik dari [DummyJSON](https://dummyjson.com).

Tema warna dan tipografi mengikuti gaya Prudential (merah `#da291c` dan font Open Sans).

Demo: https://aryomuhammad1.github.io/react-dashboard-ntt

---

## Fitur

### Login

- Login menggunakan `POST /auth/login` dari DummyJSON
- Validasi form dan pesan error yang jelas jika username atau password salah
- Sesi disimpan agar pengguna tetap login setelah halaman dimuat ulang
- Halaman dashboard tidak dapat diakses sebelum login

### Layout

- Sidebar (Home, Product, Logout), navbar, dan area konten utama
- Sidebar berubah menjadi drawer pada layar kecil

### Home

- Menampilkan `Welcome, {firstName} {lastName}` dari data pengguna yang sedang login

### Product

- Daftar produk dengan pencarian, filter kategori, pengurutan, dan pagination
- Detail produk
- Tambah produk
- Ubah produk
- Hapus produk

---

## Catatan Implementasi

Terdapat tiga hal yang saya putuskan sendiri selama pengerjaan. Saya tuliskan di sini agar alasannya jelas.

### 1. Filter Disimpan di URL

Seluruh kondisi tabel disimpan di URL, bukan di dalam state aplikasi:

```
#/products?q=iphone&category=smartphones&sortBy=price&order=desc&page=2
```

Dengan demikian URL tersebut dapat disalin, dikirim ke orang lain, atau disimpan sebagai bookmark, dan tampilannya akan otomatis sama persis. Tombol back dan forward pada browser juga berfungsi normal, serta filter tidak hilang ketika halaman dimuat ulang.

Kolom pencarian sedikit berbeda. Teks yang diketik disimpan sementara di dalam komponen agar ketikan tetap responsif, kemudian ditulis ke URL setelah pengguna berhenti mengetik selama 400ms. Tujuannya agar history browser tidak penuh oleh setiap huruf yang diketik.

### 2. Data dari DummyJSON Tidak Benar-Benar Tersimpan

DummyJSON merupakan API tiruan. Endpoint tambah, ubah, dan hapus memang membalas dengan response yang benar, tetapi datanya tidak disimpan di server:

- `POST /products/add` membalas `201` dengan id baru, tetapi `GET /products/195` menghasilkan `404`
- `PUT /products/1` membalas data yang sudah diubah, tetapi `GET /products/1` masih menampilkan data lama
- `DELETE /products/1` membalas `isDeleted: true`, tetapi produknya masih ada

Jika hasil API ditampilkan apa adanya, fitur CRUD akan tampak tidak berfungsi.

Solusinya, setiap aksi tetap memanggil API sungguhan, kemudian hasilnya juga disimpan pada state lokal (Zustand) yang dilapiskan di atas data dari server. Dengan cara ini CRUD tampak bekerja normal dan tetap tersimpan setelah halaman dimuat ulang.

Konsekuensinya, produk yang baru ditambahkan selalu muncul di halaman pertama dengan label "Baru", karena server tidak mengetahui keberadaan produk tersebut sehingga tidak dapat mengurutkannya. Untuk menghapus seluruh perubahan lokal, hapus localStorage melalui DevTools.

### 3. Pencarian dan Filter Kategori Secara Bersamaan

DummyJSON tidak memiliki endpoint yang dapat melakukan pencarian di dalam satu kategori. Endpoint-nya terpisah:

- `/products/search?q=` untuk pencarian
- `/products/category/{nama}` untuk filter kategori

Karena itu, jika pencarian dan kategori digunakan bersamaan, aplikasi mengambil seluruh produk pada kategori tersebut, kemudian menyaring, mengurutkan, dan memotong halamannya di sisi klien. Pendekatan ini aman karena jumlah produk per kategori sedikit (total seluruh produk hanya 194).

Jika hanya salah satu yang digunakan, seluruh proses dikerjakan di server menggunakan `limit`, `skip`, `sortBy`, dan `order`.

---

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | React 19 |
| Bahasa | TypeScript |
| Build tool | Vite |
| Routing | React Router v7 |
| State management | Zustand |
| Styling | Tailwind CSS v4 |
| Komponen UI | shadcn/ui (Radix) |
| Form dan validasi | React Hook Form + Zod |
| Notifikasi | Sonner |
| Ikon | Lucide |
| Font | Open Sans |

### Alasan Menggunakan Zustand

Terdapat tiga store dengan tugas masing-masing:

| Store | Isi |
| --- | --- |
| `authStore` | data pengguna, token, login dan logout (disimpan di localStorage) |
| `productStore` | data produk dari server, status loading dan error, serta perubahan CRUD lokal |
| `uiStore` | kondisi sidebar |

Pembagiannya, URL menyimpan kondisi pencarian dan filter, sedangkan Zustand menyimpan data dari server dan hasil CRUD. Kondisi filter sengaja tidak dimasukkan ke Zustand karena URL sudah menanganinya dengan lebih baik, dan menyimpannya di dua tempat berisiko membuat datanya tidak sinkron.

Pada umumnya data dari server ditangani oleh library seperti TanStack Query, sedangkan Zustand digunakan untuk state di sisi klien saja. Pada aplikasi ini data produk tetap saya simpan di Zustand karena endpoint yang digunakan hanya dua dan tidak membutuhkan caching yang kompleks. Bagian yang paling rumit justru melapiskan perubahan CRUD lokal di atas data dari server, dan proses tersebut tetap harus berada di dalam store. Menambahkan satu library lagi menjadi kurang sepadan. Untuk aplikasi berskala lebih besar, saya akan memindahkan data server ke TanStack Query dan menyisakan Zustand untuk auth dan UI.

---

## Menjalankan Secara Lokal

Membutuhkan Node.js versi 20.19 ke atas.

```bash
npm install
npm run dev
```

Aplikasi dapat diakses melalui http://localhost:5173/react-dashboard-ntt/

Perintah lainnya:

```bash
npm run build     # build untuk production
npm run preview   # memeriksa hasil build
npm run lint      # memeriksa kualitas kode
```

### Akun Demo

```
username: emilys
password: emilyspass
```

Tersedia tombol Isi Otomatis pada halaman login. Daftar akun lainnya dapat dilihat di https://dummyjson.com/users

---

## Struktur Folder

```
src/
├── components/
│   ├── ui/          komponen dasar yang digunakan berulang
│   ├── layout/      navbar, sidebar, kerangka halaman
│   └── routing/     penjaga halaman login
├── features/
│   ├── auth/        halaman login
│   ├── home/        halaman home
│   └── products/    halaman produk dan form
├── stores/          state Zustand
├── hooks/
│   ├── queries/     hook untuk mengambil data
│   └── mutations/   hook untuk tambah, ubah, dan hapus
├── lib/             API client dan helper
└── types/           tipe TypeScript
```

Seluruh pemanggilan API dari halaman dipindahkan ke `hooks/queries` dan `hooks/mutations`. Dengan demikian halaman tidak perlu menangani `useEffect`, status loading, maupun notifikasi, cukup menggunakan hook tersebut dan menentukan navigasi setelah proses selesai.

---

## Penanganan Token

Token disimpan di localStorage. Idealnya token disimpan pada httpOnly cookie agar lebih aman dari XSS, namun DummyJSON menyimpan cookie pada domain mereka sendiri sedangkan aplikasi ini berjalan pada domain yang berbeda, sehingga cookie tersebut tidak dapat digunakan.

Token kedaluwarsa ditangani secara otomatis. Ketika access token habis, aplikasi memanggil `/auth/refresh` satu kali kemudian mengulang request sebelumnya. Jika masih gagal, pengguna diarahkan ke halaman login.

---

Aplikasi ini dibuat untuk keperluan technical test dan tidak berafiliasi dengan Prudential.
