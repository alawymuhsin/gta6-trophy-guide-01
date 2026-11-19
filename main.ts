// Entry gta6-trophy-guide-01 — panduan + tracker trophy GTA VI (Node 22, stdlib saja).
// Program ini menyerahkan panduan: menyalin app/ dan screenshots/ dari samping file ini
// ke /output (atau MAKEFUN_OUTPUT_DIR di luar grader) lalu menulis /output/dossier.json
// dengan library make.fun yang divendor. vendor/makefun-frontend.ts jangan diubah: scorer
// mengharuskan dossier.json sama persis dengan yang ditulis salinan library miliknya.
//
// Catatan pembangun: dossier yang dihasilkan di sini mencakup 55 trophy resmi GTA VI
// beserta panduan kata-kata sendiri di app/data/trophies.json; sebelum submit, jalankan
// `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` lalu periksa out/dossier.json.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas gate (reference/gate.json): teks dossier maks 163.840 byte; maks 4 screenshot @ 256 KiB;
// app/ maks 993 file/direktori dan 48 MiB — semuanya dihitung bersama /output (cap 1000 entri).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log(`dossier ditulis ke ${join(out, 'dossier.json')}`);
