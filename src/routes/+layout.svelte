<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { page } from "$app/state";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";
  import "@fontsource-variable/plus-jakarta-sans";
  import "../index.css";

  let { children }: { children: Snippet } = $props();

  // Shell statis di app.html (agar FCP cepat) dibuang begitu aplikasi sudah tampil.
  onMount(() => document.getElementById("boot")?.remove());

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));
</script>

{#if isAuthRoute}
  {@render children()}
{:else}
  <CourseLayout>
    {@render children()}
  </CourseLayout>
{/if}
