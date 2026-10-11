# PROGRES — Shorts Studio

> File tracking proses pengerjaan. Diupdate setiap langkah selesai.
> Spek penuh: `AGENTS.md` (§1–§13). Stack: Next.js 16 + TS strict + Tailwind + Prisma MySQL.

## Konvensi update
- Setiap selesai satu fase: tambah baris di Riwayat + centang checklist fase.
- Status: `done` / `wip` / `blocked`. Kalau blocked, tulis penyebab + langkah lanjut.

## Status ringkas
- Proyek: Shorts Studio (antrean job + dashboard, BUKAN video maker)
- Repo: `/root/youtube`
- Domain: `https://short.hgitopup.web.id` → `127.0.0.1:3001`
- App tetangga: `pansa-gateway` di `/root/project` → `127.0.0.1:3000` (jangan diganggu)
- Port Shorts Studio: **3001** (3000 sudah dipakai)
- Runtime: PM2 (mengikuti pola server ini) + nginx reverse proxy + certbot TLS
- Terakhir update: 2026-10-11 (SELESAI full build Shorts Studio, live di subdomain)

## Riwayat
| Tanggal (UTC) | Fase / Langkah | Status | Bukti / Catatan |
|---|---|---|---|
| 2026-10-11 | Scaffold Next.js 16.4.0 (TS, Tailwind, ESLint, App Router) di `/root/youtube` | done | `tsc --noEmit` 0, `eslint` 0 |
| 2026-10-11 | Restore AGENTS.md (blok nextjs-agent-rules + spek §1–§13, 232 baris) | done | head = nextjs-agent-rules, tail = batasan |
| 2026-10-11 | Cek sistem: nginx + PM2 `pansa-gateway:3000`, DNS `short.hgitopup.web.id → 139.59.237.172` | done | `ss`, `pm2 list`, `dig @8.8.8.8` |
| 2026-10-11 | Buat `docs/PROGRES.md` (file ini) | done | — |
| 2026-10-11 | Kunci port 3001 + `NEXT_PUBLIC_APP_URL=https://short.hgitopup.web.id` | done | `package.json:start = next start -H 127.0.0.1 -p 3001`, `.env.example` |
| 2026-10-11 | Nginx vhost subdomain + TLS certbot | done | `/etc/nginx/sites-available/shorts-studio`, cert `short.hgitopup.web.id` exp 2027-01-09, HTTP→301 HTTPS |
| 2026-10-11 | PM2 `shorts-studio` online + cek HTTPS | done | `pm2 list` online, `https://short.hgitopup.web.id` 200, `hgitopup.web.id` tetap 200, `pm2 save` + startup enabled |
| 2026-10-11 | Fase 1 fondasi: deps pin (prisma 6.19.3, zod 4.6.5, bcryptjs 3.0.3, jose 6.2.12), lib/constants+env+db+schemas+jobs+agent-auth, schema Prisma jobs/job_events, DB+user MySQL, `migrate dev init` OK | done | `migration.sql` applied, Prisma Client generated |
| 2026-10-11 | Fase 2 auth: `proxy.ts` + `lib/session.ts` (jose 7 hari) + `lib/auth-guard.ts` + `lib/login-limit.ts` (5/15 mnt) + `/login` + `POST /api/auth/login|logout` | done | diverifikasi tsc+lint di fase 6 |
| 2026-10-11 | Fase 3 halaman: dashboard `/` (filter+pagination 20, badge, link YT, error, Ulangi/Reset via Server Action) + `/jobs/new` (zod per-field) + `/jobs/[id]` (semua field, unduh MP4, timeline JobEvent), teks Indonesia | done | diverifikasi tsc+lint di fase 6 |
| 2026-10-11 | Fase 4 API agent: `requireAgentKey` (timingSafeEqual) + `GET jobs` (FIFO pending, 100) + `POST claim` (atomik updateMany) + `PATCH` done/failed (zod domain YT) + `POST video` (MP4 MIME+ftyp, stream, `<jobId>.mp4`) + `GET /api/jobs/[id]/video` admin attachment | done | claim race 200+409, PATCH 400/409, upload non-MP4 400, unduh admin 200 attachment |
| 2026-10-11 | Fase 5 script+docs: `setup` (idempotent OK) + `hash-password` + pin semua versi + `docs/` (DEPLOY, mysql-setup.sql, nginx-short.conf, shorts-studio.service) + layout id | done | tsc 0, lint 0 |
| 2026-10-11 | Bugfix: proxy blokir `/api/auth/*` (tambah whitelist) + redirect bocor ke localhost:3001 (lib/public-url.ts via X-Forwarded-Proto/Host) + cacheComponents vs force-dynamic (matikan cacheComponents) + Date.now purity (serverNow) | done | login→domain publik, build 0 |
| 2026-10-11 | Fase 6 verifikasi §12 + redeploy: tsc/lint/build bersih, guard+401+login/logout+rate-limit(5/15mnt)+claim race+PATCH+upload+unduh+bundle bersih, PM2 restart+save, data uji dibersihkan | done | semua 200/401/409/400 sesuai spek |
| 2026-10-11 | Rombak UI/UX penuh: `globals.css` (float/pop/rise/shimmer/pulse-dot, stagger, card-lift, btn-press), komponen baru (aurora, stat-card, job-card, event-timeline, header kaca, badge ikon), halaman (hero+statistik+empty state, form kartu, detail hero, login kartu). tsc/lint/build 0, redeploy PM2, API tetap 401/200 OK | done | live https://short.hgitopup.web.id |

## Checklist fase (urut kerja)
- [x] 0. Scaffold + AGENTS.md restore + verifikasi tsc/lint
- [x] 0b. Go-live tahap awal (starter): port 3001, nginx vhost, TLS, PM2 — `https://short.hgitopup.web.id` 200
- [x] 1. Fondasi: deps pin, `.env.example`, `.gitignore` (`uploads/`), `lib/constants.ts`, `lib/env.ts`, `lib/db.ts`, `lib/schemas.ts`, `lib/jobs.ts`, `lib/agent-auth.ts`, Prisma schema + migrate init OK
- [x] 2. Auth admin: `proxy.ts`, `/login`, logout, rate-limit
- [x] 3. Halaman: `/` dashboard, `/jobs/new`, `/jobs/[id]`, semua teks Indonesia, mobile-first 360px
- [x] 4. API agent: `GET jobs`, `POST claim` (atomik), `PATCH` done/failed, `POST video` (MP4 + magic bytes)
- [x] 5. Script: `setup`, `hash-password`; `docs/` (DEPLOY, nginx, systemd, mysql-setup.sql)
- [x] 6. Go-live subdomain: build, PM2, nginx, TLS, cek checklist §12
- [x] 7. Verifikasi akhir §12 (claim race, 401/409/400, upload, no secret di bundle, 360px)
- [ ] 8. Sisa manual: cek tampilan 360px di browser HP + ganti password admin default (lihat bawah)
- [x] 9. Rombak UI/UX: aurora bg animasi + hero gradien + stat card + filter pil + kartu job + timeline + form + login, ikon lucide-react 1.55.0, stagger/pop/rise/float/shimmer, reduced-motion, responsif 360px→desktop (grid 2 kol)

## Keputusan infra (dicatat agar tidak lupa)
1. **Port 3001** untuk Shorts Studio — port 3000 milik `pansa-gateway` (PM2, `/root/project`). Jangan ubah.
2. **Bind `127.0.0.1` saja** (§10 AGENTS.md). Publik hanya lewat nginx. `package.json:start` = `next start -H 127.0.0.1 -p 3001`.
3. **Nginx**: file `docs/nginx-short.conf` = sumber; aktif di `/etc/nginx/sites-available/shorts-studio` → symlink `sites-enabled/`. `client_max_body_size 250m` (upload MP4 200MB + margin).
4. **TLS**: cert existing hanya `CN=hgitopup.web.id` (tanpa wildcard). Jalankan `certbot --nginx -d short.hgitopup.web.id` (atau `--expand` bila digabung). HTTP→HTTPS redirect wajib (§10).
5. **Runtime**: PM2 `shorts-studio` (ikut pola server ini). File `docs/shorts-studio.service` tetap disediakan sebagai contoh systemd sesuai §10, tapi yang dipakai aktif = PM2.
6. **DB**: MySQL di `127.0.0.1:3306` (via docker-proxy). DB `shorts_studio` + user khusus, `migrate deploy` untuk produksi.
