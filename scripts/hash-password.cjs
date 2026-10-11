#!/usr/bin/env node
/**
 * npm run hash-password — hasilkan ADMIN_PASSWORD_HASH dari input interaktif.
 * Mencetak nilai yang sudah ter-escape untuk .env (AGENTS.md §4).
 */
const readline = require("node:readline");
const bcrypt = require("bcryptjs");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Kata sandi admin: ", (password) => {
  rl.close();
  if (!password) {
    console.error("Kata sandi tidak boleh kosong.");
    process.exit(1);
  }
  const hash = bcrypt.hashSync(password, 12);
  const escaped = hash.replace(/\$/g, "\\$");
  console.log("\nTempel baris berikut ke .env (sudah ter-escape):");
  console.log(`ADMIN_PASSWORD_HASH='${escaped}'`);
});
