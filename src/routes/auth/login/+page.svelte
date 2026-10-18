<script lang="ts">
  import { goto } from "$app/navigation";
  import LoginPage from "../../../features/auth/pages/LoginPage.svelte";
</script>

<LoginPage onSuccess={() => goto("/")} />
