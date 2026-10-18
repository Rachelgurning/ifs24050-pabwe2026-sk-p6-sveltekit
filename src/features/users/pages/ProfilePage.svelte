<script lang="ts">
  import { loadProfile, profile } from "../../auth/states/authStore";
  import {
    showErrorDialog,
    showSuccessDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper";
  import type { ApiResult } from "../../../helpers/apiHelper";
  import { btnPrimary, cardClass, inputClass, labelClass } from "../../common/ui";
  import { postPhoto, putMe, putPassword } from "../api/userApi";

  // svelte-ignore state_referenced_locally
  let name = $state($profile ? $profile.name : "");
  // svelte-ignore state_referenced_locally
  let email = $state($profile ? $profile.email : "");
  let currentPassword = $state("");
  let newPassword = $state("");
  let photoInput: HTMLInputElement;
  let busy = $state("");

  async function finish(result: ApiResult, refresh: boolean) {
    busy = "";
    if (!result.success) {
      await showErrorDialog(result.message);
      return false;
    }
    if (refresh) await loadProfile();
    await showSuccessDialog(result.message);
    return true;
  }

  async function handleData(event: SubmitEvent) {
    event.preventDefault();
    busy = "data";
    await finish(await putMe({ name, email }), true);
  }

  async function handlePhoto(event: SubmitEvent) {
    event.preventDefault();
    const file = photoInput.files[0];
    if (!file) {
      await showWarningDialog("Pilih berkas foto terlebih dahulu.");
      return;
    }
    busy = "photo";
    await finish(await postPhoto(file), true);
  }

  async function handlePassword(event: SubmitEvent) {
    event.preventDefault();
    busy = "password";
    const done = await finish(
      await putPassword({ password: currentPassword, new_password: newPassword }),
      false
    );
    if (done) {
      currentPassword = "";
      newPassword = "";
    }
  }
</script>

<svelte:head>
  <title>Profil · Delcom Courses</title>
</svelte:head>

<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Profil</h1>
<p class="mt-1 text-slate-700">Kelola data akun, foto, dan kata sandi kamu.</p>

<div class="mt-8 grid gap-6 lg:grid-cols-2">
  <section class={`${cardClass} p-6`} aria-labelledby="data-heading">
    <h2 id="data-heading" class="text-xl font-extrabold text-slate-900">Data akun</h2>
    <form class="mt-5 space-y-4" onsubmit={handleData}>
      <div>
        <label class={labelClass} for="profile-name">Nama</label>
        <input id="profile-name" class={inputClass} type="text" autocomplete="name" required bind:value={name} />
      </div>
      <div>
        <label class={labelClass} for="profile-email">Email</label>
        <input id="profile-email" class={inputClass} type="email" autocomplete="email" required bind:value={email} />
      </div>
      <button type="submit" class={btnPrimary} disabled={busy === "data"}>Simpan perubahan</button>
    </form>
  </section>

  <section class={`${cardClass} p-6`} aria-labelledby="photo-heading">
    <h2 id="photo-heading" class="text-xl font-extrabold text-slate-900">Foto profil</h2>
    <div class="mt-5 flex items-center gap-4">
      {#if $profile && $profile.photo}
        <img src={$profile.photo} alt="Foto profil saat ini" width="64" height="64" class="h-16 w-16 rounded-full object-cover" />
      {:else}
        <span class="grid h-16 w-16 place-items-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-800" aria-hidden="true">
          {$profile ? $profile.name.charAt(0).toUpperCase() : "?"}
        </span>
      {/if}
      <p class="text-sm text-slate-700">{$profile ? $profile.email : ""}</p>
    </div>
    <form class="mt-5 space-y-4" onsubmit={handlePhoto}>
      <div>
        <label class={labelClass} for="profile-photo">Pilih foto baru</label>
        <input id="profile-photo" bind:this={photoInput} class={inputClass} type="file" accept="image/png,image/jpeg,image/webp" required />
      </div>
      <button type="submit" class={btnPrimary} disabled={busy === "photo"}>Unggah foto</button>
    </form>
  </section>

  <section class={`${cardClass} p-6 lg:col-span-2`} aria-labelledby="password-heading">
    <h2 id="password-heading" class="text-xl font-extrabold text-slate-900">Ubah kata sandi</h2>
    <form class="mt-5 grid gap-4 sm:grid-cols-2" onsubmit={handlePassword}>
      <div>
        <label class={labelClass} for="current-password">Kata sandi saat ini</label>
        <input id="current-password" class={inputClass} type="password" autocomplete="current-password" required bind:value={currentPassword} />
      </div>
      <div>
        <label class={labelClass} for="new-password">Kata sandi baru</label>
        <input id="new-password" class={inputClass} type="password" autocomplete="new-password" minlength="6" required bind:value={newPassword} />
      </div>
      <div class="sm:col-span-2">
        <button type="submit" class={btnPrimary} disabled={busy === "password"}>Ubah kata sandi</button>
      </div>
    </form>
  </section>
</div>
