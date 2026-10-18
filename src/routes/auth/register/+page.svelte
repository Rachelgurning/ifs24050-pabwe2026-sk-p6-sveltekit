<script lang="ts">
  import { goto } from "$app/navigation";
  import RegisterPage from "../../../features/auth/pages/RegisterPage.svelte";
</script>

<RegisterPage onSuccess={() => goto("/auth/login")} />
