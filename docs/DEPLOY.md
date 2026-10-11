# DEPLOY — Shorts Studio ke Ubuntu VPS (AGENTS.md §10)

Server ini memakai **PM2 + nginx + certbot** (mengikuti app tetangga
`pansa-gateway`). Contoh systemd tetap disediakan (`shorts-studio.service`)
bila suatu saat pindah runtime.

## 0. Prasyarat (sekali saja — sudah ada di server ini)
- Node 24 + PM2 + nginx + certbot
- MySQL di `127.0.0.1:3306` (container `pansa-mysql`)
- DNS `short.hgitopup.web.id` → IP VPS

## 1. Database
```bash
# Ganti SHORTS_DB_PASSWORD dulu di docs/mysql-setup.sql, lalu:
docker exec -i pansa-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < docs/mysql-setup.sql
```

## 2. Aplikasi
```bash
cd /root/youtube
npm ci
npm run setup        # buat .env + AGENT_API_KEY + SESSION_SECRET (sekali saja)
npm run hash-password # tempel ADMIN_PASSWORD_HASH ke .env
# Lengkapi DATABASE_URL di .env, lalu:
npx prisma migrate deploy
npm run build
pm2 start npm --name shorts-studio -- start
pm2 save
```

## 3. Nginx + TLS
```bash
sudo cp docs/nginx-short.conf /etc/nginx/sites-available/shorts-studio
sudo ln -sf /etc/nginx/sites-available/shorts-studio /etc/nginx/sites-enabled/shorts-studio
sudo certbot --nginx -d short.hgitopup.web.id
sudo nginx -t && sudo systemctl reload nginx
```

Catatan:
- App bind `127.0.0.1:3001` (lihat `package.json` "start"); port 3000 milik pansa-gateway.
- `client_max_body_size 250m` wajib untuk upload MP4 200MB.
- Deploy selalu `prisma migrate deploy`, tidak pernah `migrate dev`/`db push`.

## 4. Update berikutnya
```bash
cd /root/youtube && git pull  # atau salin file baru
npm ci && npx prisma migrate deploy && npm run build
pm2 restart shorts-studio
```
