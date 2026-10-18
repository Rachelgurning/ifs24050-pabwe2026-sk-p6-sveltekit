<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { LoaderCircle } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { getAccessToken } from "../../../helpers/apiHelper";
  import { isProfile, loadProfile } from "../../auth/states/authStore";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  let { children }: { children: Snippet } = $props();

  // Penjaga sesi: tanpa token atau profil gagal dimuat, arahkan ke halaman masuk.
  onMount(async () => {
    if (!getAccessToken()) {
      await goto("/auth/login");
    } else if (!$isProfile && !(await loadProfile())) {
      await goto("/auth/login");
    }
  });
</script>

<a
  href="#main"
  class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-indigo-800"
>
  Lewati ke konten utama
</a>

<Navbar />

<div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col md:flex-row">
  <Sidebar />
  <main id="main" class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
    {#if $isProfile}
      {@render children()}
    {:else}
      <div class="flex items-center justify-center gap-3 py-24 text-slate-700" role="status">
        <LoaderCircle class="animate-spin" size={22} aria-hidden="true" />
        <span>Memuat sesi...</span>
      </div>
    {/if}
  </main>
</div>
