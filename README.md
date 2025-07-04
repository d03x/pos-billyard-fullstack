# 🎱 Billiard Management System

Aplikasi manajemen meja bilyard dengan **Fastify** (Backend) dan **Frontend modern** (Vue/React).  
Termasuk fitur: pemesanan meja, statistik pendapatan, dan monitoring aktifitas pelanggan.

---

## 📂 Struktur Proyek

```
.
├── frontend/         # Frontend app (React/Vue)
└── backend/          # Backend app (Fastify, Prisma)
```

---

## 🚀 Instalasi Cepat

### Prasyarat:
- [Bun](https://bun.sh) terinstal (`bun --version`)
- [Node.js](https://nodejs.org/) (jika pakai frontend)
- [PostgreSQL / MySQL / SQLite] (salah satu DB untuk Prisma)
- [Git](https://git-scm.com/)

---

## ⚙️ Backend Setup

Masuk ke direktori `backend`:

```bash
cd backend
```

### 1. Instal Dependensi

```bash
bun install
```

### 2. Konfigurasi Database

Edit file `.env` di dalam folder `backend` (buat jika belum ada):

```env
DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
```

Ganti sesuai konfigurasi database kamu.

### 3. Inisialisasi Prisma

Buat migrasi awal & generate client:

```bash
bun run prisma:migrate
```

### 4. Jalankan Server Development

```bash
bun run dev
```

Server berjalan di `http://localhost:3000` atau sesuai pengaturan `fastify`.

### 5. (Opsional) Buka Prisma Studio

Untuk mengecek isi database:

```bash
bun run prisma:studio
```

---

## 🎨 Frontend Setup

Masuk ke direktori `frontend`:

```bash
cd frontend
```

> Pastikan kamu sudah tahu apakah menggunakan **Vite** / **Next.js** / **Nuxt** di bagian ini.

### 1. Instal Dependensi

```bash
npm install
# atau
yarn install
# atau
bun install
```

### 2. Jalankan Frontend Dev Server

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (jika menggunakan Vite).

---

## 🧪 Skrip Penting

| Perintah | Fungsi |
|---------|--------|
| `bun run dev` | Menjalankan server Fastify |
| `bun run prisma:migrate` | Membuat & apply migrasi DB |
| `bun run prisma:generate` | Generate Prisma Client |
| `bun run prisma:studio` | Buka UI database via browser |

---

## 📦 Tools yang Digunakan

- ⚡ **Bun** sebagai runtime & bundler backend
- 🚀 **Fastify** untuk API server
- 🧬 **Prisma ORM** untuk database
- 🗓 **Day.js** untuk manipulasi waktu
- 📅 **node-cron** untuk task terjadwal

---

## 🙌 Kontribusi

Pull Request dan saran fitur sangat diterima! Pastikan menjalankan `lint` dan `format` sebelum push.

---

## 📄 Lisensi

MIT License © 2025 – Dadan Hidayat
