#!/usr/bin/env node
/**
 * npm run setup (idempotent, AGENTS.md §9):
 * - buat .env dari .env.example bila belum ada
 * - generate AGENT_API_KEY (32 alfanumerik) bila kosong, tampilkan sekali
 * - generate SESSION_SECRET bila kosong
 * - buat folder uploads/
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const EXAMPLE_PATH = path.join(ROOT, ".env.example");

function random32() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(32);
  let s = "";
  for (const b of bytes) s += chars[b % chars.length];
  return s;
}

function loadEnvFile(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

if (!fs.existsSync(ENV_PATH)) {
  const example = fs.existsSync(EXAMPLE_PATH) ? fs.readFileSync(EXAMPLE_PATH, "utf8") : "";
  fs.writeFileSync(ENV_PATH, example, { mode: 0o600 });
  console.log(".env dibuat dari .env.example");
}

let envText = fs.readFileSync(ENV_PATH, "utf8");
const env = loadEnvFile(envText);

function setIfEmpty(key, value, showOnce) {
  if (!env[key]) {
    const line = `${key}="${value}"`;
    if (new RegExp(`^\\s*${key}\\s*=`, "m").test(envText)) {
      envText = envText.replace(new RegExp(`^\\s*${key}\\s*=.*$`, "m"), line);
    } else {
      if (envText && !envText.endsWith("\n")) envText += "\n";
      envText += `${line}\n`;
    }
    env[key] = value;
    if (showOnce) {
      console.log(`\n⚠️  ${key} baru dibuat (SALIN SEKARANG, hanya ditampilkan sekali):\n${value}\n`);
    } else {
      console.log(`${key} dibuat.`);
    }
    return true;
  }
  return false;
}

const keyChanged = setIfEmpty("AGENT_API_KEY", random32(), true);
if (!keyChanged) console.log("AGENT_API_KEY sudah ada (tidak ditimpa, tidak ditampilkan).");
setIfEmpty("SESSION_SECRET", random32(), false);

fs.writeFileSync(ENV_PATH, envText, { mode: 0o600 });

const uploads = path.join(ROOT, env["UPLOAD_DIR"] || "./uploads");
fs.mkdirSync(uploads, { recursive: true });
console.log(`Folder uploads siap: ${uploads}`);
console.log("Setup selesai.");
