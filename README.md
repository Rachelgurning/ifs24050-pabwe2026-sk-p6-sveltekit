# Delcom Courses (SvelteKit 3 + TypeScript)

Studi Kasus 2 - Praktik Framework JS P6. Data dari Delcom Open API (`/courses`).

## Menjalankan

```bash
bun install
cp .env.example .env   # atau pakai .env bawaan (APP_PORT=3005)
bun run dev            # http://localhost:3005
bun run test:coverage  # wajib 100%
bun run build && bun start
```

## Struktur

- `src/routes` - halaman (`/`, `/courses/[courseId]`, `/courses/[courseId]/contents/[contentId]`, `/auth/*`, `/users`, `/profile`, `+error.svelte`)
- `src/features/{auth,users,courses,common}` - logika fitur (api, states, layouts, components, modals, pages)
- `src/helpers`, `src/hooks` - `apiHelper`, `toolsHelper`, `useInput`

Aplikasi berjalan sebagai SPA (`ssr = false`) di root host, sehingga aman dipasang pada
prefix host `https://ifs24050-pabwe2026-sk-p6-sveltekit...` tanpa base path.

## Catatan perbaikan deploy

- `@sveltejs/kit@3.1.0` mensyaratkan `typescript@^6`; sebelumnya proyek memakai `^5.9.3`
  sehingga `npm install` di platform deploy gagal (ERESOLVE) dan stage **Deploy Application** FAIL.
  Dependensi dinaikkan ke `typescript@^6.0.3` dan `bun.lock` dibuat ulang.
- `.npmrc` (`legacy-peer-deps=true`) ditambahkan sebagai pengaman bila platform memakai `npm install`.
- Build produksi wajib lewat Bun (`bun run build`) karena memakai `@sveltejs/adapter-bun`.
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 45bd4f1c444eff778a86acc34724719b576f9641
>>>>>>> 394f90fa2496d3707b07c96d0031057fd64a632c

## Lighthouse Best Practices 100

- **Deprecated API (CORS `Access-Control-Allow-Headers: *` + `Authorization`)**: browser kini memanggil
  `/api/v1/*` (same-origin). `src/routes/api/v1/[...path]/+server.ts` meneruskannya ke Delcom Open API
  sehingga tidak ada preflight CORS lintas-origin. Upstream dapat diubah lewat env `DELCOM_API_UPSTREAM`.
- **Header keamanan** (X-Frame-Options, COOP, nosniff, Referrer-Policy, Permissions-Policy) lewat
  `src/hooks.server.ts` (Bun) dan `vercel.json` (Vercel, termasuk aset statis).
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 394f90fa2496d3707b07c96d0031057fd64a632c

## Performance (Lighthouse)

- Font **Plus Jakarta Sans** dihost sendiri (`@fontsource-variable/plus-jakarta-sans`, `font-display: swap`),
  tidak ada lagi request/preconnect ke Google Fonts.
- Aplikasi berjalan sebagai SPA (`ssr = false`), jadi `src/app.html` memuat shell "Memuat…" dengan CSS inline
  agar First Contentful Paint terjadi tepat setelah HTML tiba. Shell dibuang di `+layout.svelte` saat mount.
<<<<<<< HEAD

## Optimasi gambar (Vercel)

Cover kursus dan foto profil berasal dari server Delcom (tanpa cache, ukuran asli besar). Saat build di Vercel
(`VERCEL=1`), `src/helpers/imageHelper.ts` mengalihkannya ke Vercel Image Optimization (`/_vercel/image`):
diperkecil sesuai ukuran tampilan (`srcset`/`sizes`), AVIF/WebP, dan cache 1 tahun (`minimumCacheTTL`).
Konfigurasinya ada di `vite.config.ts` (`adapterVercel({ images })`). Di Bun/Jenkins/lokal URL asli dipakai.
Kartu kursus pertama dimuat `eager` + `fetchpriority="high"` karena kandidat LCP.
=======
=======
=======
>>>>>>> 74fc50872d8910e0819e2e3766b7ee8a496daa9d
>>>>>>> 45bd4f1c444eff778a86acc34724719b576f9641
>>>>>>> 394f90fa2496d3707b07c96d0031057fd64a632c
