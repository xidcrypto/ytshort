-- Setup MySQL untuk Shorts Studio (AGENTS.md §10).
-- Jalankan sebagai root: docker exec -i pansa-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < docs/mysql-setup.sql
-- Ganti SHORTS_DB_PASSWORD dengan password kuat sebelum dijalankan.

CREATE DATABASE IF NOT EXISTS shorts_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'shorts_user'@'%' IDENTIFIED BY 'SHORTS_DB_PASSWORD';

GRANT ALL PRIVILEGES ON shorts_studio.* TO 'shorts_user'@'%';

FLUSH PRIVILEGES;
