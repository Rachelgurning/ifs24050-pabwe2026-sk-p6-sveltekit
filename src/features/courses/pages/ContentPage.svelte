<script lang="ts">
  import { untrack } from "svelte";
  import { ArrowLeft, CircleCheck, Circle, LoaderCircle } from "lucide-svelte";
  import {
    getYoutubeId,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";
  import { btnPrimary, btnSecondary } from "../../common/ui";
  import { getContent, postContentStatus } from "../api/courseApi";
  import { content, setContent } from "../states/coursesStore";

  let { courseId, contentId }: { courseId: string; contentId: string } = $props();

  let errorMessage = $state("");
  let saving = $state(false);


  async function load(id: string) {
    errorMessage = "";
    const result = await getContent(id);
    if (result.success) {
      setContent(result.data.course_content);
    } else {
      errorMessage = result.message;
    }
  }

  $effect(() => {
    const id = contentId;
    untrack(() => {
      setContent(null);
      load(id);
    });
  });

  async function toggleStatus() {
    saving = true;
    const next = $content.my_status_finished ? 0 : 1;
    const result = await postContentStatus(contentId, next);
    saving = false;
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    await load(contentId);
    await showSuccessDialog(result.message);
  }
</script>

<svelte:head>
  <title>{`${$content ? $content.title : "Materi"} · Delcom Courses`}</title>
</svelte:head>

<a
  href={`/courses/${courseId}`}
  class="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-indigo-800 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-700"
>
  <ArrowLeft size={16} aria-hidden="true" /> Kembali ke kursus
</a>

{#if errorMessage}
  <p class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900" role="alert">{errorMessage}</p>
{:else if !$content}
  <div class="flex items-center justify-center gap-3 py-24 text-slate-700" role="status">
    <LoaderCircle class="animate-spin" size={22} aria-hidden="true" />
    <span>Memuat materi...</span>
  </div>
{:else}
  {@const videoId = getYoutubeId($content.youtube)}
  <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{$content.title}</h1>

  <div class="mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-sm">
    {#if videoId}
      <iframe
        class="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={`Video materi: ${$content.title}`}
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>
    {:else}
      <div class="grid h-full w-full place-items-center p-6 text-center text-white">
        <p>
          Tautan video tidak dikenali.
          <a class="font-semibold underline" href={$content.youtube} target="_blank" rel="noopener noreferrer">Buka tautan asli</a>
        </p>
      </div>
    {/if}
  </div>

  <div class="mt-6 flex flex-wrap items-center gap-4">
    <button type="button" class={$content.my_status_finished ? btnSecondary : btnPrimary} disabled={saving} onclick={toggleStatus}>
      {#if $content.my_status_finished}
        <Circle size={16} aria-hidden="true" /> Tandai belum selesai
      {:else}
        <CircleCheck size={16} aria-hidden="true" /> Tandai selesai
      {/if}
    </button>
    <p class="text-sm font-semibold text-slate-800" aria-live="polite">
      Status: {$content.my_status_finished ? "Selesai dipelajari" : "Belum selesai"}
    </p>
  </div>
{/if}
