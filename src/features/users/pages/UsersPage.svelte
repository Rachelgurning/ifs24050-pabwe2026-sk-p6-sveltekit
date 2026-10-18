<script lang="ts">
  import { onMount } from "svelte";
  import { LoaderCircle } from "lucide-svelte";
  import { getUsers } from "../api/userApi";
  import { setUsers, users } from "../states/userStore";

  let loading = $state(true);
  let errorMessage = $state("");

  onMount(async () => {
    const result = await getUsers();
    if (result.success) {
      setUsers(result.data.users);
    } else {
      errorMessage = result.message;
    }
    loading = false;
  });
</script>

<svelte:head>
  <title>Pengguna · Delcom Courses</title>
</svelte:head>

<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Pengguna</h1>
<p class="mt-1 text-slate-700">Daftar seluruh pengguna yang terdaftar di Delcom.</p>

<section class="mt-8" aria-label="Daftar pengguna">
  {#if loading}
    <div class="flex items-center justify-center gap-3 py-20 text-slate-700" role="status">
      <LoaderCircle class="animate-spin" size={22} aria-hidden="true" />
      <span>Memuat pengguna...</span>
    </div>
  {:else if errorMessage}
    <p class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900" role="alert">{errorMessage}</p>
  {:else if $users.length === 0}
    <p class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-700">Belum ada pengguna.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each $users as user (user.id)}
        <li class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {#if user.photo}
            <img src={user.photo} alt="" width="48" height="48" loading="lazy" class="h-12 w-12 rounded-full object-cover" />
          {:else}
            <span class="grid h-12 w-12 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-800" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </span>
          {/if}
          <div class="min-w-0">
            <p class="truncate font-bold text-slate-900">{user.name}</p>
            <p class="truncate text-sm text-slate-600">{user.email}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
