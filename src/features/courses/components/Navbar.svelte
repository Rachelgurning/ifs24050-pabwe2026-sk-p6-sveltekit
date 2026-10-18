<script lang="ts">
  import { GraduationCap, LogOut } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import { logout, profile } from "../../auth/states/authStore";
  import { btnSecondary } from "../../common/ui";

  async function handleLogout() {
    if (await showConfirmDialog("Keluar dari akun?", "Sesi kamu akan diakhiri.", "Ya, keluar")) {
      logout();
      await goto("/auth/login");
    }
  }
</script>

<header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
    <a href="/" class="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-indigo-700">
      <span class="grid h-9 w-9 place-items-center rounded-lg bg-indigo-700 text-white" aria-hidden="true">
        <GraduationCap size={20} />
      </span>
      <span class="text-lg font-extrabold tracking-tight text-slate-900">Delcom Courses</span>
    </a>

    <div class="flex items-center gap-3">
      {#if $profile}
        <a
          href="/profile"
          class="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-700"
        >
          {#if $profile.photo}
            <img src={$profile.photo} alt="" width="32" height="32" class="h-8 w-8 rounded-full object-cover" />
          {:else}
            <span class="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-800" aria-hidden="true">
              {$profile.name.charAt(0).toUpperCase()}
            </span>
          {/if}
          <span class="max-w-40 truncate text-sm font-semibold text-slate-800 max-sm:sr-only">{$profile.name}</span>
        </a>
      {/if}
      <button type="button" class={btnSecondary} onclick={handleLogout}>
        <LogOut size={16} aria-hidden="true" />
        <span class="max-sm:sr-only">Keluar</span>
      </button>
    </div>
  </div>
</header>
