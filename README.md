# Tracker Trophy Leonida — Panduan Trophy GTA VI

![make.fun badge](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/alawymuhsin/gta6-trophy-guide-01/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/alawymuhsin/gta6-trophy-guide-01/reward.svg)

Entry untuk kompetisi make.fun [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01): panduan + tracker offline untuk seluruh 55 trophy PlayStation 5 Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden).

## Yang ada di aplikasi

- **Checklist 55 trophy** dengan nama, deskripsi, dan grade resmi persis seperti daftar PlayStation (sumber: Exophase dan PSNProfiles), plus panduan tiap trophy yang ditulis dengan kata-kata sendiri dan mengutip sumbernya.
- **Tracker**: progres tersimpan di `localStorage`, bisa export ke JSON dan import kembali, filter berdasarkan grade, jenis (story, misi, aktivitas, koleksi, combat, eksplorasi, ekonomi), pencarian, dan filter missable / sudah didapat.
- **Mode spoiler**: menyembunyikan nama dan deskripsi trophy cerita/hidden sampai trophy itu didapat.
- **Roadmap 5 tahap menuju platinum** dan **daftar 20 trophy missable** — keduanya disusun dari deskripsi resmi tiap trophy.
- **Tanpa network saat runtime**: semua file berada di bawah `app/`, tanpa font/CDN eksternal, tanpa logo atau artwork Rockstar Games.

## Screenshot

Empat screenshot di `screenshots/` adalah render asli aplikasi ini di Chromium (1280×800), diambil dari `serve.ts` dengan progres contoh 13 trophy. Lihat `shots.json` untuk tampilan tiap file.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

## Menyerahkan (build dossier)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib saja) menyalin `app/` dan `screenshots/` ke direktori output dan menulis `dossier.json` via `vendor/makefun-frontend.ts`.

## Sumber data

- Exophase — daftar trophy resmi GTA VI: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — daftar trophy resmi GTA VI: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi

Lisensi: MIT (lihat `LICENSE`).
