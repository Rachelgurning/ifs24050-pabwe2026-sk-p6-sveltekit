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
