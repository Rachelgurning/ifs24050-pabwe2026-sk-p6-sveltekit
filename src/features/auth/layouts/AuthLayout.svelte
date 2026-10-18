<script lang="ts">
  import type { Snippet } from "svelte";
  import { GraduationCap, BookOpen, Video, Star } from "lucide-svelte";
  import AuthSessionRedirect from "../components/AuthSessionRedirect.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<AuthSessionRedirect />

<div class="min-h-screen lg:grid lg:grid-cols-2">
  <aside
    class="bg-gradient-to-br from-indigo-800 to-indigo-950 px-6 py-10 text-white lg:flex lg:flex-col lg:justify-center lg:px-16"
  >
    <div class="mx-auto w-full max-w-md">
      <div class="flex items-center gap-3">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-white/15" aria-hidden="true">
          <GraduationCap size={28} />
        </span>
        <p class="text-2xl font-extrabold tracking-tight">Delcom Courses</p>
      </div>
      <p class="mt-6 text-lg font-semibold leading-snug" data-testid="auth-tagline">
        Belajar kapan saja lewat kursus video, dari pengajar mana pun.
      </p>
      <p class="mt-3 text-indigo-100">
        Buat kursus sendiri, ikuti materi video YouTube, tandai progres belajar,
        dan beri rating pada kursus yang kamu ikuti.
      </p>
      <ul class="mt-8 hidden space-y-3 text-indigo-100 lg:block">
        <li class="flex items-center gap-3"><BookOpen size={20} aria-hidden="true" /> Katalog kursus terbuka</li>
        <li class="flex items-center gap-3"><Video size={20} aria-hidden="true" /> Materi video terstruktur</li>
        <li class="flex items-center gap-3"><Star size={20} aria-hidden="true" /> Rating dan ulasan peserta</li>
      </ul>
    </div>
  </aside>

  <main id="main" class="flex items-center justify-center px-6 py-10">
    <div class="w-full max-w-md">
      {@render children()}
    </div>
  </main>
</div>
