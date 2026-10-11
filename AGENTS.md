<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Shorts Studio

Panduan untuk AI coding agent yang mengerjakan repo ini. Baca seluruhnya sebelum menulis kode.

## 1. Ringkasan proyek

Shorts Studio adalah **antrean job + dashboard pemantau** untuk produksi YouTube Shorts.

Alur kerja:

1. Admin mengisi formulir topik di dashboard → tersimpan sebagai `Job` berstatus `pending`.
2. AI assistant eksternal melakukan polling `GET /api/agent/jobs?status=pending` setiap ~10 menit.
3. Assistant meng-**claim** job, membuat video di tempat lain, mengunggahnya ke YouTube.
4. Assistant melapor lewat API: `done` (+ link YouTube) atau `failed` (+ pesan error). Opsional: mengunggah file MP4.

**Aplikasi ini TIDAK membuat video.** Tidak ada ffmpeg, GPU, ataupun kredensial YouTube di sini. Jangan menambahkannya. Tidak perlu websocket/realtime; refresh biasa sudah cukup.

## 2. Tech stack

- Next.js 16 (App Router), TypeScript strict, Tailwind CSS
- MySQL via Prisma (`provider = "mysql"`)
- Validasi: zod (semua input formulir dan API)
- Hash password: `bcryptjs` (atau `argon2`)
- Sesi admin: cookie httpOnly bertanda tangan (`jose`)
- Runtime produksi: `next start` port 3000, systemd, reverse proxy Caddy/Nginx

> Pin versi dependensi di `package.json`. Karena Next.js 16 relatif baru, cek dokumentasi resmi untuk perubahan API (mis. `middleware.ts` diganti nama menjadi `proxy.ts`, `params` di route handler berupa Promise yang harus di-`await`). Jangan menebak dari memori.

## 3. Perintah

```bash
npm install
npm run setup            # buat .env + generate AGENT_API_KEY (lihat §9)
npm run hash-password    # hasilkan ADMIN_PASSWORD_HASH dari input interaktif
npx prisma migrate dev   # development
npx prisma migrate deploy # produksi (WAJIB, jangan pakai migrate dev di server)
npm run dev
npm run build && npm start
npm run lint && npx tsc --noEmit
```

## 4. Environment variable

| Nama | Keterangan |
|---|---|
| `DATABASE_URL` | `mysql://user:password@localhost:3306/shorts_studio` |
| `AGENT_API_KEY` | 32 karakter acak. **Server-only.** |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt password admin |
| `SESSION_SECRET` | Min. 32 karakter acak untuk menandatangani cookie sesi |
| `NEXT_PUBLIC_APP_URL` | URL publik, mis. `https://studio.contoh.com` |
| `UPLOAD_DIR` | Opsional, default `./uploads` |

Aturan:

- **Jangan pernah** memakai awalan `NEXT_PUBLIC_` pada `AGENT_API_KEY`, `ADMIN_PASSWORD_HASH`, atau `SESSION_SECRET`, dan jangan mengimpor keduanya di Client Component.
- Hash bcrypt mengandung karakter `$` yang akan di-expand oleh loader `.env` Next.js. Di `.env`, tulis dengan escape: `ADMIN_PASSWORD_HASH='\$2b\$12\$...'` atau escape tiap `$` dengan `\$`. Script `hash-password` harus mencetak nilai yang sudah ter-escape.
- Buat `lib/env.ts` yang memvalidasi semua variabel dengan zod saat startup dan gagal dengan pesan jelas jika ada yang kurang.
- `.env` dan `uploads/` wajib masuk `.gitignore`. Sediakan `.env.example` tanpa nilai rahasia.

## 5. Model data (Prisma)

```prisma
model Job {
  id             String   @id @default(cuid())
  topic          String   @db.Text
  title          String?
  description    String?  @db.Text
  privacy        String   @default("public")   // public | unlisted | private
  status         String   @default("pending")  // pending | processing | done | failed
  youtubeUrl     String?
  youtubeVideoId String?
  error          String?  @db.Text
  videoFile      String?                       // nama file di UPLOAD_DIR, dibuat server
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  events         JobEvent[]

  @@index([status])
}

model JobEvent {
  id        String   @id @default(cuid())
  jobId     String
  job       Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  fromStatus String?
  toStatus   String
  note       String?  @db.Text
  createdAt  DateTime @default(now())

  @@index([jobId])
}
```

Catatan:

- `JobEvent` diperlukan untuk **riwayat perubahan status** di halaman detail. Setiap perubahan status (termasuk saat job dibuat: `null → pending`) menulis satu `JobEvent`, **dalam transaksi yang sama** dengan update `Job`.
- `videoFile` diperlukan untuk fitur unduh MP4.
- Status dan privasi disimpan sebagai string, tetapi definisikan sekali sebagai konstanta + zod enum di `lib/constants.ts` dan pakai di mana-mana.
- Jika `title` kosong saat pembuatan job, isi dengan `topic` (dipotong maks. 100 karakter, batas judul YouTube).

## 6. Halaman (semua teks UI berbahasa Indonesia, mobile-first)

1. **`/` Dashboard** — daftar semua job (kartu di HP, tabel di layar lebar), terbaru di atas. Tiap job: topik/judul, badge status berwarna, tanggal dibuat (format Indonesia). Jika `done` tampilkan link YouTube yang bisa diklik (`target="_blank" rel="noopener noreferrer"`); jika `failed` tampilkan pesan error. Filter status sederhana. Gunakan pagination (mis. 20 per halaman).
2. **`/jobs/new` Buat video baru** — formulir: `topic` (wajib, textarea), `title` (opsional), `description` (opsional), `privacy` (radio/select: public/unlisted/private, default public). Tampilkan error validasi per field. Server Action atau route handler, divalidasi zod di server.
3. **`/jobs/[id]` Detail job** — semua field job, tombol unduh jika `videoFile` ada, dan timeline riwayat status dari `JobEvent`.
4. **`/login`** — formulir password admin.

Tombol "Ulangi" pada job `failed` (membuat `pending` kembali) dan "Reset" pada job `processing` yang macet lebih dari 2 jam adalah tambahan yang disarankan, karena assistant bisa mati di tengah jalan dan job tidak akan pernah selesai.

## 7. Autentikasi admin

- Login: bandingkan password dengan `ADMIN_PASSWORD_HASH` memakai `bcrypt.compare`.
- Sesi: cookie `httpOnly`, `secure` di produksi, `sameSite=lax`, `path=/`, masa berlaku 7 hari, berisi token bertanda tangan (`SESSION_SECRET`).
- Semua halaman dan route admin dilindungi (via `proxy.ts` **dan** pengecekan ulang di server component/handler; jangan hanya mengandalkan satu lapis). `/login` dan `/api/agent/*` dikecualikan dari cek sesi (API agent punya autentikasi sendiri).
- Batasi percobaan login (mis. 5 gagal per IP per 15 menit, in-memory sudah cukup) dan beri jeda kecil saat gagal.
- Sediakan tombol logout.

## 8. REST API agent (`/api/agent/*`)

Semua endpoint wajib header `x-api-key`. Buat satu helper `requireAgentKey(request)` dan pakai di setiap handler.

- Bandingkan key dengan `crypto.timingSafeEqual` (hash dulu kedua sisi dengan SHA-256 agar panjangnya sama), bukan `===`.
- Gagal → `401` `{ "error": "Unauthorized" }`. Jangan membocorkan alasan detail.
- Semua body/query divalidasi zod; gagal → `400` dengan detail error.
- Set `export const dynamic = "force-dynamic"`; respons tidak boleh di-cache.
- Format error konsisten: `{ "error": "pesan" }`.

### `GET /api/agent/jobs?status=pending`

- Query `status` opsional (zod enum). Tanpa query → semua job (batasi, mis. 100 terbaru).
- Urutan: `createdAt` ascending untuk `pending` (FIFO).
- Respons: `{ "jobs": [{ id, topic, title, description, privacy, status, createdAt }] }`. (`status` ditambahkan karena berguna bagi agent.)

### `POST /api/agent/jobs/[id]/claim`

- Harus **atomik** untuk mencegah dua agent mengambil job yang sama:
  ```ts
  const res = await tx.job.updateMany({
    where: { id, status: "pending" },
    data: { status: "processing" },
  });
  if (res.count === 0) → 409 (atau 404 jika id tidak ada)
  ```
  Jangan membaca status dulu lalu menulis (race condition).
- Tulis `JobEvent` (`pending → processing`) dalam transaksi yang sama.
- Sukses → `200` dengan data job. Sudah diklaim/bukan pending → `409`. Id tidak ada → `404`.

### `PATCH /api/agent/jobs/[id]`

- Body: `{ status: "done" | "failed", youtubeUrl?, youtubeVideoId?, error? }`.
- Aturan zod: jika `done` maka `youtubeUrl` wajib dan harus URL valid berdomain YouTube; jika `failed` maka `error` wajib (maks. 2000 karakter).
- Hanya boleh dari `processing`. Selain itu → `409`.
- Tulis `JobEvent` dalam transaksi yang sama.

### `POST /api/agent/jobs/[id]/video`

- `multipart/form-data` dengan field `file`.
- Validasi: harus MP4 (periksa MIME **dan** magic bytes `ftyp` pada offset 4), batas ukuran (default 200 MB, konfigurasi), job harus ada.
- Simpan ke `UPLOAD_DIR` dengan nama buatan server (`<jobId>.mp4`). **Jangan pernah memakai nama file dari klien** (path traversal). Tulis lewat stream, bukan memuat seluruh file ke memori.
- Simpan nama file di `Job.videoFile`.
- Unduhan: `GET /api/jobs/[id]/video` khusus admin (cek sesi), dengan `Content-Disposition: attachment`. `uploads/` **tidak boleh** berada di dalam `public/`.
- Ingat batas ukuran body di reverse proxy (lihat §10).

## 9. Script setup

`npm run setup` (idempotent):

- Jika `.env` belum ada, buat dari `.env.example`.
- Jika `AGENT_API_KEY` kosong: generate 32 karakter acak dengan `crypto.randomBytes` (alfanumerik), tulis ke `.env`, dan **tampilkan sekali** di terminal beserta peringatan untuk menyalinnya.
- Jika sudah ada: jangan timpa dan jangan cetak ulang; cukup katakan "sudah ada".
- Generate `SESSION_SECRET` dengan cara yang sama jika kosong.
- Buat folder `uploads/`.

## 10. Deployment (Ubuntu VPS)

Semua contoh ada di folder `docs/`:

- `docs/mysql-setup.sql` — buat database `shorts_studio` (`utf8mb4`), user khusus, dan `GRANT` hanya pada database itu:
  ```sql
  CREATE DATABASE shorts_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'shorts_user'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
  GRANT ALL PRIVILEGES ON shorts_studio.* TO 'shorts_user'@'localhost';
  FLUSH PRIVILEGES;
  ```
  (Prisma Migrate di `migrate dev` butuh hak membuat shadow database; untuk produksi yang memakai `migrate deploy`, hak pada `shorts_studio.*` sudah cukup.)
- `docs/shorts-studio.service` — unit systemd: `User` non-root, `WorkingDirectory`, `EnvironmentFile=` mengarah ke `.env`, `ExecStart=/usr/bin/npm start` (atau `next start -H 127.0.0.1 -p 3000`), `Restart=always`, `RestartSec=5`, dan jika memakai hardening, `ReadWritePaths=` harus mencakup folder `uploads`.
- `docs/Caddyfile` — reverse proxy ke `127.0.0.1:3000`, HTTPS otomatis. Untuk Nginx sediakan juga contoh dengan `client_max_body_size 250m;` dan redirect HTTP→HTTPS.
- `docs/DEPLOY.md` — langkah: install Node & MySQL, buat DB, clone, `.env`, `npm ci`, `npx prisma migrate deploy`, `npm run build`, aktifkan systemd, konfigurasi proxy.

Aturan:

- App hanya listen di `127.0.0.1`; akses publik hanya lewat proxy.
- **HTTPS wajib aktif** karena `x-api-key` dan cookie sesi dikirim lewat jaringan. Jangan sediakan jalur HTTP tanpa redirect.
- Deploy memakai `prisma migrate deploy`, tidak pernah `migrate dev` atau `db push`.

## 11. Konvensi kode

- TypeScript strict, tanpa `any`. Satu instance Prisma client di `lib/db.ts` (pola singleton agar aman saat hot reload).
- Server Component sebagai default; Client Component hanya bila perlu interaksi.
- Logika bisnis (claim, update status, tulis event) di `lib/jobs.ts`, bukan di dalam handler; handler hanya parse → validasi → panggil → respons.
- Skema zod bersama di `lib/schemas.ts`, dipakai formulir dan API.
- Jangan log `AGENT_API_KEY`, password, atau isi header otorisasi.
- Teks UI dan pesan error untuk admin berbahasa Indonesia; nama variabel/kode dalam bahasa Inggris. Pesan error API boleh bahasa Inggris singkat agar mudah diproses agent.
- Tampilan: bersih, target sentuh minimal 44px, tanpa horizontal scroll di lebar 360px.

## 12. Definisi selesai (checklist)

- [ ] `npx tsc --noEmit` dan `npm run lint` bersih; `npm run build` sukses.
- [ ] Tanpa login, semua halaman admin mengalihkan ke `/login`; tanpa/dengan key salah, semua `/api/agent/*` memberi 401.
- [ ] Dua request `claim` bersamaan pada job yang sama: tepat satu sukses, satu 409.
- [ ] `PATCH` dari status selain `processing` ditolak 409; `done` tanpa `youtubeUrl` ditolak 400.
- [ ] Upload bukan-MP4 atau terlalu besar ditolak; file tersimpan sebagai `<jobId>.mp4`; unduhan hanya untuk admin.
- [ ] `AGENT_API_KEY` tidak muncul di bundle client (cek `.next/static`).
- [ ] Riwayat status tampil lengkap di halaman detail.
- [ ] Berjalan benar di lebar layar 360px.

## 13. Batasan (jangan lakukan)

- Jangan menambahkan pembuatan video, ffmpeg, integrasi YouTube, websocket, atau antrean eksternal (Redis dsb.).
- Jangan menambahkan sistem multi-user/registrasi; hanya satu password admin.
- Jangan menyimpan file upload di `public/`.
- Jangan menambah dependensi besar tanpa alasan jelas.
