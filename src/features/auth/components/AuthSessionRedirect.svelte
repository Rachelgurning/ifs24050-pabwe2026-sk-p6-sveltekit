<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getAccessToken } from "../../../helpers/apiHelper";
  import { loadProfile } from "../states/authStore";

  // Pemeriksaan sesi dilakukan sekali saat dimuat. Pengalihan hanya terjadi
  // bila token, status login, dan profil sudah siap bersamaan (loadProfile),
  // sehingga tidak berlomba dengan reset status saat keluar.
  onMount(async () => {
    if (getAccessToken() && (await loadProfile())) {
      await goto("/");
    }
  });
</script>
