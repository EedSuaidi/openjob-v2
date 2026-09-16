# OpenJob API

REST API untuk platform pencarian kerja **OpenJob**. Aplikasi ini menyediakan pengelolaan pengguna, autentikasi berbasis JWT, perusahaan, kategori, lowongan pekerjaan, lamaran, bookmark, profil pengguna, upload dokumen, cache Redis, serta notifikasi lamaran lewat RabbitMQ dan email.

> Dokumentasi ini menjelaskan perilaku implementasi yang ada pada repository saat ini.

![Entity Relationship Diagram OpenJob](./ERD-OpenJob-versi-1.jpg)

## Daftar isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Arsitektur](#arsitektur)
- [Prasyarat](#prasyarat)
- [Instalasi dan menjalankan aplikasi](#instalasi-dan-menjalankan-aplikasi)
- [Konfigurasi environment](#konfigurasi-environment)
- [Migrasi database](#migrasi-database)
- [Model data](#model-data)
- [Autentikasi](#autentikasi)
- [Referensi API](#referensi-api)
- [Header respons dan cache](#header-respons-dan-cache)
- [Validasi dan format error](#validasi-dan-format-error)
- [Struktur direktori](#struktur-direktori)
- [Catatan implementasi](#catatan-implementasi)

## Fitur

- Registrasi pengguna dengan email unik dan password yang di-hash menggunakan bcrypt.
- Login, refresh access token, dan logout melalui penyimpanan refresh token di PostgreSQL.
- Access token JWT berlaku selama **3 jam**.
- CRUD perusahaan, kategori, dan lowongan pekerjaan.
- Pencarian lowongan berdasarkan judul dan/atau nama perusahaan.
- Pembuatan, pembaruan status, penghapusan, dan penyaringan lamaran.
- Bookmark lowongan untuk pengguna yang sedang login.
- Profil pengguna aktif untuk melihat data diri, riwayat lamaran, dan bookmark miliknya.
- Update profil pengguna dengan validasi dan pengecekan kepemilikan data.
- Upload, daftar, unduh, dan hapus dokumen PDF.
- Cache Redis untuk detail dan daftar perusahaan, serta detail pengguna.
- Invalidasi cache otomatis saat data perusahaan/user berubah.
- Notifikasi lamaran via RabbitMQ dan email menggunakan Nodemailer.
- Validasi body dan parameter URL menggunakan Zod.
- Respons error terpadu untuk error klien (`400`, `401`, `404`) dan error server (`500`).

## Teknologi

| Komponen           | Teknologi         |
| ------------------ | ----------------- |
| Runtime            | Node.js (ESM)     |
| Framework HTTP     | Express 5         |
| Database           | PostgreSQL        |
| Driver database    | `pg`              |
| Migrasi            | `node-pg-migrate` |
| Validasi           | Zod               |
| Password           | bcrypt            |
| Token              | jsonwebtoken      |
| Cache              | Redis             |
| Message broker     | RabbitMQ          |
| Email              | Nodemailer        |
| Upload file        | Multer            |
| Konfigurasi        | dotenv            |
| Development server | nodemon           |

## Arsitektur

Setiap resource mengikuti pemisahan tanggung jawab berikut:

```text
HTTP request
  -> route
  -> middleware (autentikasi / validasi)
  -> controller
  -> service
  -> PostgreSQL / Redis / RabbitMQ
  -> JSON response
```

- **Route** mendefinisikan URL dan middleware tiap endpoint.
- **Middleware** memverifikasi Bearer token, memvalidasi input, dan menerjemahkan error menjadi respons JSON.
- **Controller** mengambil data dari request dan membentuk respons HTTP.
- **Service** menyimpan logika bisnis dan query PostgreSQL.
- **Cache service** menangani Redis untuk data yang sering dibaca.
- **Exception** menyatakan error klien secara eksplisit agar status HTTP konsisten.

## Prasyarat

- Node.js 20 LTS atau versi yang kompatibel dengan dependensi proyek.
- npm.
- PostgreSQL yang berjalan dan dapat diakses.
- Redis (opsional untuk cache, tetapi aplikasi tetap berjalan tanpa Redis).
- RabbitMQ (opsional untuk notifikasi lamaran).
- SMTP/MAIL server jika ingin menggunakan notifikasi email.

## Instalasi dan menjalankan aplikasi

1. Clone repository lalu masuk ke folder proyek.

   ```bash
   git clone <URL-repository>
   cd openjob
   ```

2. Instal dependensi.

   ```bash
   npm install
   ```

3. Buat database PostgreSQL, misalnya `openjob`.

4. Buat file `.env` di root berdasarkan bagian [Konfigurasi environment](#konfigurasi-environment).

5. Terapkan skema database.

   ```bash
   npm run migrate:up
   ```

6. Jalankan server development.

   ```bash
   npm run start:dev
   ```

7. Jalankan consumer RabbitMQ dari project `openjob-consumer` pada terminal terpisah:

   ```bash
   cd ../openjob-consumer
   npm install
   npm run start
   ```

Server akan mendengarkan pada `http://localhost:5000` bila `HOST` dan `PORT` tidak diubah. Tidak ada endpoint root atau health check yang didefinisikan; gunakan endpoint resource seperti `GET /jobs` untuk memeriksa koneksi aplikasi.

### Perintah npm

| Perintah                                   | Kegunaan                                    |
| ------------------------------------------ | ------------------------------------------- |
| `npm run start:dev`                        | Menjalankan `src/server.js` dengan nodemon. |
| `npm run migrate:create -- <nama-migrasi>` | Membuat file migrasi baru.                  |
| `npm run migrate:up`                       | Menjalankan migrasi yang belum diterapkan.  |
| `npm run migrate:down`                     | Membatalkan satu batch migrasi terakhir.    |

## Konfigurasi environment

File `.env` tidak di-commit. Gunakan nilai yang aman untuk lingkungan Anda dan jangan membagikan key JWT maupun password database.

```dotenv
HOST=localhost
PORT=5000

PGHOST=localhost
PGPORT=5432
PGDATABASE=openjob
PGUSER=postgres
PGPASSWORD=ganti_dengan_password_database

ACCESS_TOKEN_KEY=ganti_dengan_rahasia_access_token_yang_panjang
REFRESH_TOKEN_KEY=ganti_dengan_rahasia_refresh_token_yang_berbeda_dan_panjang

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
# atau gunakan AMQP_URL jika sudah disediakan
# AMQP_URL=amqp://guest:guest@localhost:5672

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password

DOCUMENTS_UPLOAD_DIR=uploads/documents
```

`pg` membaca variabel `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, dan `PGPASSWORD` secara otomatis saat `new Pool()` dipanggil. `node-pg-migrate` juga dapat memakai parameter PostgreSQL tersebut; alternatifnya gunakan `DATABASE_URL`, contohnya:

```dotenv
DATABASE_URL=postgres://postgres:password@localhost:5432/openjob
```

## Migrasi database

Migrasi yang tersedia membuat tabel berikut.

| Tabel             | Fungsi                           | Relasi utama                                        |
| ----------------- | -------------------------------- | --------------------------------------------------- |
| `users`           | Akun pengguna dan peran.         | Direferensikan oleh `applications` dan `bookmarks`. |
| `companies`       | Data perusahaan.                 | Memiliki banyak `jobs`; memiliki `owner_id`.        |
| `categories`      | Kategori pekerjaan.              | Memiliki banyak `jobs`.                             |
| `jobs`            | Lowongan pekerjaan.              | Milik satu perusahaan dan satu kategori.            |
| `applications`    | Lamaran pengguna.                | Milik satu pengguna dan satu lowongan.              |
| `bookmarks`       | Lowongan yang disimpan pengguna. | Milik satu pengguna dan satu lowongan.              |
| `authentications` | Refresh token aktif.             | Menyimpan token sebagai teks.                       |

`companies` menambahkan kolom `owner_id` melalui migrasi terpisah. Foreign key pada `jobs`, `applications`, dan `bookmarks` memakai `ON DELETE CASCADE`. Menghapus perusahaan atau kategori dapat ikut menghapus lowongan terkait; penghapusan lowongan dapat ikut menghapus lamaran dan bookmark terkait.

## Model data

| Entitas        | Kolom                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| User           | `id`, `name`, `email`, `password`, `role`, `created_at`                         |
| Company        | `id`, `name`, `location`, `description`, `owner_id`, `created_at`               |
| Category       | `id`, `name`, `created_at`                                                      |
| Job            | `id`, `title`, `description`, `company_id`, `category_id`, `created_at`         |
| Application    | `id`, `user_id`, `job_id`, `status`, `created_at`                               |
| Bookmark       | `id`, `user_id`, `job_id`, `created_at`                                         |
| Authentication | `token`                                                                         |
| Document       | `id`, `user_id`, `filename`, `original_name`, `mime_type`, `size`, `created_at` |

Status awal lamaran adalah `pending`; nilai yang diterima untuk pembaruan adalah `pending`, `accepted`, atau `rejected`. ID dikirim sebagai string pada sebagian besar respons agar konsisten dengan serialisasi data service.

## Autentikasi

1. Daftarkan pengguna melalui `POST /users`.
2. Login melalui `POST /authentications` untuk memperoleh `accessToken` dan `refreshToken`.
3. Kirim access token untuk endpoint privat:

   ```http
   Authorization: Bearer <accessToken>
   ```

4. Saat access token kedaluwarsa, kirim refresh token ke `PUT /authentications` untuk mendapatkan access token baru.
5. Logout dengan `DELETE /authentications` untuk menghapus refresh token dari database.
6. Endpoint yang memerlukan token juga dapat memvalidasi `req.user.id` untuk menentukan pengguna aktif.

## Referensi API

Base URL pengembangan: `http://localhost:5000`

Seluruh body request menggunakan `Content-Type: application/json`. Contoh di bawah menggunakan nilai ID ilustratif.

### Pengguna

| Method | Endpoint     | Auth  | Deskripsi                                        |
| ------ | ------------ | :---: | ------------------------------------------------ |
| `POST` | `/users`     | Tidak | Mendaftarkan pengguna baru.                      |
| `GET`  | `/users/:id` | Tidak | Mendapatkan pengguna berdasarkan ID.             |
| `PUT`  | `/users/:id` |  Ya   | Memperbarui profil pengguna aktif hanya sendiri. |

**POST `/users`**

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "rahasia123",
  "role": "jobseeker"
}
```

Respons `201`:

```json
{
  "status": "success",
  "message": "Pengguna berhasil didaftarkan.",
  "data": { "id": "1" }
}
```

**PUT `/users/:id`**

```json
{
  "name": "Budi Santoso Updated",
  "email": "budi.updated@example.com",
  "password": "passwordbaru123"
}
```

Respons `200`:

```json
{
  "status": "success",
  "message": "Pengguna berhasil diperbarui.",
  "data": {
    "id": "1",
    "name": "Budi Santoso Updated",
    "email": "budi.updated@example.com",
    "role": "jobseeker"
  }
}
```

### Autentikasi

| Method   | Endpoint           | Auth  | Deskripsi                                                 |
| -------- | ------------------ | :---: | --------------------------------------------------------- |
| `POST`   | `/authentications` | Tidak | Login dan membuat pasangan token.                         |
| `PUT`    | `/authentications` | Tidak | Menukar refresh token terdaftar dengan access token baru. |
| `DELETE` | `/authentications` |  Ya   | Menghapus refresh token (logout).                         |

**POST `/authentications`**

```json
{ "email": "budi@example.com", "password": "rahasia123" }
```

Respons `200`:

```json
{
  "status": "success",
  "message": "Autentikasi berhasil.",
  "data": {
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<jwt-refresh-token>"
  }
}
```

Body untuk `PUT` dan `DELETE /authentications`:

```json
{ "refreshToken": "<jwt-refresh-token>" }
```

### Profil pengguna aktif

Semua endpoint profil memerlukan access token.

| Method | Endpoint                | Deskripsi                                                                         |
| ------ | ----------------------- | --------------------------------------------------------------------------------- |
| `GET`  | `/profile`              | Profil pengguna dari token.                                                       |
| `GET`  | `/profile/applications` | Lamaran milik pengguna dari token, lengkap dengan judul lowongan dan perusahaan.  |
| `GET`  | `/profile/bookmarks`    | Bookmark milik pengguna dari token, lengkap dengan judul lowongan dan perusahaan. |

### Perusahaan

| Method   | Endpoint         | Auth  | Deskripsi               |
| -------- | ---------------- | :---: | ----------------------- |
| `GET`    | `/companies`     | Tidak | Daftar perusahaan.      |
| `GET`    | `/companies/:id` | Tidak | Detail perusahaan.      |
| `POST`   | `/companies`     |  Ya   | Menambahkan perusahaan. |
| `PUT`    | `/companies/:id` |  Ya   | Memperbarui perusahaan. |
| `DELETE` | `/companies/:id` |  Ya   | Menghapus perusahaan.   |

Body `POST`/`PUT /companies`:

```json
{
  "name": "PT Nusantara Teknologi",
  "location": "Jakarta",
  "description": "Perusahaan teknologi Indonesia."
}
```

`description` bersifat opsional. Jika tidak diberikan pada pembuatan, nilainya menjadi string kosong.

### Kategori

| Method   | Endpoint          | Auth  | Deskripsi             |
| -------- | ----------------- | :---: | --------------------- |
| `GET`    | `/categories`     | Tidak | Daftar kategori.      |
| `GET`    | `/categories/:id` | Tidak | Detail kategori.      |
| `POST`   | `/categories`     |  Ya   | Menambahkan kategori. |
| `PUT`    | `/categories/:id` |  Ya   | Memperbarui kategori. |
| `DELETE` | `/categories/:id` |  Ya   | Menghapus kategori.   |

Body `POST`/`PUT /categories`:

```json
{ "name": "Backend Development" }
```

### Lowongan pekerjaan

| Method   | Endpoint                     | Auth  | Deskripsi                                                                  |
| -------- | ---------------------------- | :---: | -------------------------------------------------------------------------- |
| `GET`    | `/jobs`                      | Tidak | Daftar lowongan beserta nama perusahaan dan kategori. Mendukung pencarian. |
| `GET`    | `/jobs/company/:companyId`   | Tidak | Lowongan milik perusahaan tertentu.                                        |
| `GET`    | `/jobs/category/:categoryId` | Tidak | Lowongan dalam kategori tertentu.                                          |
| `GET`    | `/jobs/:id`                  | Tidak | Detail lowongan, perusahaan, dan kategori.                                 |
| `POST`   | `/jobs`                      |  Ya   | Menambahkan lowongan.                                                      |
| `PUT`    | `/jobs/:id`                  |  Ya   | Memperbarui lowongan.                                                      |
| `DELETE` | `/jobs/:id`                  |  Ya   | Menghapus lowongan.                                                        |

Parameter pencarian `GET /jobs`:

| Query          | Contoh                         | Efek                                                                |
| -------------- | ------------------------------ | ------------------------------------------------------------------- |
| `title`        | `/jobs?title=backend`          | Pencocokan sebagian judul, tanpa membedakan kapitalisasi.           |
| `company-name` | `/jobs?company-name=nusantara` | Pencocokan sebagian nama perusahaan, tanpa membedakan kapitalisasi. |

Kedua parameter dapat digabungkan. Body `POST`/`PUT /jobs`:

```json
{
  "title": "Backend Engineer",
  "description": "Membangun dan memelihara layanan backend.",
  "company_id": 1,
  "category_id": 1
}
```

### Bookmark

Seluruh endpoint bookmark memerlukan access token. Bookmark selalu dikaitkan dengan pengguna dalam token.

| Method   | Endpoint                    | Deskripsi                                                            |
| -------- | --------------------------- | -------------------------------------------------------------------- |
| `POST`   | `/jobs/:jobId/bookmark`     | Menyimpan lowongan.                                                  |
| `GET`    | `/jobs/:jobId/bookmark/:id` | Mendapatkan detail bookmark berdasarkan ID bookmark.                 |
| `DELETE` | `/jobs/:jobId/bookmark`     | Menghapus simpanan lowongan milik pengguna aktif.                    |
| `GET`    | `/bookmarks`                | Daftar bookmark pengguna aktif dengan judul lowongan dan perusahaan. |

Contoh respons sukses pembuatan bookmark (`201`):

```json
{
  "status": "success",
  "message": "Pekerjaan berhasil disimpan.",
  "data": { "id": "4" }
}
```

### Lamaran pekerjaan

Seluruh endpoint lamaran memerlukan access token.

| Method   | Endpoint                     | Deskripsi                             |
| -------- | ---------------------------- | ------------------------------------- |
| `POST`   | `/applications`              | Membuat lamaran untuk pengguna aktif. |
| `GET`    | `/applications`              | Semua lamaran.                        |
| `GET`    | `/applications/user/:userId` | Lamaran untuk pengguna tertentu.      |
| `GET`    | `/applications/job/:jobId`   | Lamaran pada lowongan tertentu.       |
| `GET`    | `/applications/:id`          | Detail lamaran.                       |
| `PUT`    | `/applications/:id`          | Memperbarui status lamaran.           |
| `DELETE` | `/applications/:id`          | Menghapus lamaran.                    |

Body pembuatan lamaran:

```json
{ "job_id": 1 }
```

Satu pengguna hanya dapat melamar satu lowongan sekali. Upaya duplikat mengembalikan `400`.

Body pembaruan status:

```json
{ "status": "accepted" }
```

Nilai status yang valid: `pending`, `accepted`, dan `rejected`.

### Dokumen PDF

Endpoint dokumen memerlukan token untuk upload dan hapus, GET publik dapat diakses tanpa login. Dokumen disimpan di folder `uploads/documents` dan file dibatasi maksimal `5 MB` serta harus bertipe PDF.

| Method   | Endpoint         | Auth  | Deskripsi                                      |
| -------- | ---------------- | :---: | ---------------------------------------------- |
| `POST`   | `/documents`     |  Ya   | Upload dokumen PDF.                            |
| `GET`    | `/documents`     | Tidak | Daftar semua dokumen.                          |
| `GET`    | `/documents/:id` | Tidak | Download dokumen berdasarkan ID.               |
| `DELETE` | `/documents/:id` |  Ya   | Hapus dokumen dan file yang tersimpan di disk. |

**POST `/documents`**

Untuk upload, gunakan form-data dengan field `document`.

### Header respons dan cache

Aplikasi menggunakan header custom untuk menandai sumber data:

```http
X-Data-Source: cache
```

atau

```http
X-Data-Source: database
```

Header ini dikirim pada response yang mengambil data dari Redis atau dari PostgreSQL. Contoh endpoint dengan cache:

- `GET /companies`
- `GET /companies/:id`
- `GET /users/:id`

Setelah terjadi mutasi data seperti update/delete, cache yang terkait dihapus agar response berikutnya bersumber dari database.

### Contoh respons koleksi

`GET /jobs` mengembalikan data lowongan dalam format berikut:

```json
{
  "status": "success",
  "data": {
    "jobs": [
      {
        "id": "1",
        "title": "Backend Engineer",
        "description": "Membangun dan memelihara layanan backend.",
        "created_at": "2026-09-05T00:00:00.000Z",
        "company_name": "PT Nusantara Teknologi",
        "category_name": "Backend Development"
      }
    ]
  }
}
```

## Validasi dan format error

Validasi dilakukan sebelum controller dijalankan. Ringkasan aturan input:

| Resource                     | Aturan                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| User                         | `name` minimal 3 karakter, email valid, password minimal 6 karakter, `role` wajib string.                      |
| Login                        | Email valid dan password tidak boleh kosong.                                                                   |
| Company                      | `name` minimal 2 karakter, `location` wajib, `description` opsional.                                           |
| Category                     | `name` minimal 2 karakter.                                                                                     |
| Job                          | `title` minimal 3 karakter, `description` minimal 10 karakter, `company_id` dan `category_id` integer positif. |
| Application                  | `job_id` integer positif; status hanya `pending`, `accepted`, atau `rejected`.                                 |
| Parameter ID yang divalidasi | Integer positif maksimum `2147483647`.                                                                         |
| Document                     | Hanya file PDF dengan ukuran maksimal 5 MB.                                                                    |

Format error klien:

```json
{
  "status": "failed",
  "message": "Pesan kesalahan yang spesifik."
}
```

| Status | Kondisi umum                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Body tidak valid, email sudah digunakan, bookmark/lamaran duplikat, file upload tidak valid, atau refresh token tidak terdaftar. |
| `401`  | Kredensial salah, header Authorization tidak ada/salah, atau JWT tidak valid/kedaluwarsa.                                        |
| `404`  | Resource tidak ditemukan atau parameter ID pada rute yang tervalidasi tidak valid.                                               |
| `500`  | Error internal atau database yang tidak ditangani sebagai error klien.                                                           |

## Struktur direktori

```text
.
├── migrations/                # Definisi skema PostgreSQL
├── src/
│   ├── config/                # Koneksi database, Redis, RabbitMQ
│   ├── controllers/           # Handler request dan response
│   ├── exceptions/            # Kelas error HTTP terstruktur
│   ├── middlewares/           # Autentikasi, validasi, upload, error handler
│   ├── routes/                # Pemetaan endpoint Express
│   ├── services/              # Query, cache, dan logika bisnis
│   ├── utils/                 # Hash password dan JWT
│   ├── validators/            # Skema Zod
│   ├── app.js                 # Konfigurasi Express dan pendaftaran route
│   └── server.js              # Entry point HTTP
├── uploads/
│   └── documents/             # File PDF yang diupload
├── ERD-OpenJob-versi-1.jpg    # Diagram relasi entitas
├── package.json
├── rabbitmq-verification.mjs  # Verifikasi RabbitMQ
├── README.md
└── OpenJob API.postman_environment.json
```

## Catatan implementasi

- CORS diaktifkan secara global dan body JSON diparsing oleh `express.json()`.
- Redis diaktifkan secara opsional; jika `REDIS_HOST` tidak diatur, aplikasi tetap berfungsi tanpa cache.
- RabbitMQ bersifat opsional untuk notifikasi lamaran; jika tidak tersedia, publisher hanya akan menulis log dan tetap menjaga aplikasi berjalan.
- Consumer notifikasi berada di project terpisah `../openjob-consumer` dan memakai queue `application-notifications` yang sama.
- `GET /companies`, `GET /companies/:id`, dan `GET /users/:id` membaca cache bila tersedia. Setelah update/delete, cache yang terkait dihapus secara eksplisit.
- Tidak ada middleware otorisasi berbasis `role` pada implementasi saat ini. `role` disimpan saat registrasi, tetapi endpoint yang membutuhkan token dapat diakses oleh setiap pengguna terautentikasi.
- Endpoint daftar, detail, perubahan status, dan penghapusan lamaran tidak membatasi hasil berdasarkan pemilik lamaran; endpoint tersebut hanya mensyaratkan token valid. Hal yang sama berlaku pada operasi CRUD perusahaan, kategori, dan lowongan.
- `GET /jobs/company/:companyId`, `GET /jobs/category/:categoryId`, serta filter lamaran per pengguna/lowongan mengembalikan array kosong untuk ID yang tidak valid secara numerik, bukan `404`.
- Endpoint detail bookmark memvalidasi parameter `jobId`, tetapi detail yang dikembalikan dicari berdasarkan `:id` bookmark. Implementasi tidak memeriksa bahwa bookmark tersebut terkait dengan `:jobId` atau pengguna aktif.
- Proyek belum menyediakan skrip `test`, linter, formatter, atau seed database.

## Lisensi

Repository saat ini belum menyertakan file lisensi. Tambahkan lisensi yang sesuai sebelum mendistribusikan proyek.
