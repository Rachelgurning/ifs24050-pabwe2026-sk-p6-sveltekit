<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";
  import "../index.css";

  let { children }: { children: Snippet } = $props();

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));
</script>

{#if isAuthRoute}
  {@render children()}
{:else}
  <CourseLayout>
    {@render children()}
  </CourseLayout>
{/if}
