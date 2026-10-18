<script lang="ts">
  import { SearchX } from "lucide-svelte";
  import { btnPrimary } from "../ui";
</script>

<svelte:head>
  <title>Halaman tidak ditemukan · Delcom Courses</title>
</svelte:head>

<div class="grid min-h-[60vh] place-items-center px-6 py-10">
  <div class="max-w-md text-center">
    <span class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-100 text-indigo-800" aria-hidden="true">
      <SearchX size={32} />
    </span>
    <p class="mt-6 text-sm font-bold uppercase tracking-widest text-indigo-800">404</p>
    <h1 class="mt-2 text-3xl font-extrabold text-slate-900">Halaman tidak ditemukan</h1>
    <p class="mt-3 text-slate-700">Alamat yang kamu tuju tidak tersedia atau sudah dipindahkan.</p>
    <a class={`${btnPrimary} mt-8`} href="/">Kembali ke Semua Kursus</a>
  </div>
</div>
