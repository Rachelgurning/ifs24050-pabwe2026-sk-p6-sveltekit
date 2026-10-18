<script lang="ts">
  import { untrack } from "svelte";
  import {
    ArrowLeft,
    CircleCheck,
    GraduationCap,
    ImageIcon,
    LoaderCircle,
    Lock,
    Pencil,
    Plus,
    Star,
    Trash2,
    UserMinus,
    UserPlus,
    Video,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import type { ApiResult } from "../../../helpers/apiHelper";
  import {
    formatDate,
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";
  import { myId } from "../../auth/states/authStore";
  import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from "../../common/ui";
  import {
    deleteContent,
    deleteCourse,
    deleteStudent,
    getCourse,
    postStudent,
    putRatings,
  } from "../api/courseApi";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import {
    clearMutation,
    course,
    getRole,
    markMutation,
    mutations,
    setCourse,
  } from "../states/coursesStore";
  import type { CourseContent, MutationKey } from "../types";

  let { courseId }: { courseId: string } = $props();

  let errorMessage = $state("");
  let showChange = $state(false);
  let showCover = $state(false);
  let showContent = $state(false);
  let editingContent = $state<CourseContent | null>(null);
  let ratingValue = $state("5");
  let comment = $state("");

  const role = $derived(getRole($course, $myId));
  const canLearn = $derived(role !== "visitor");
  const roleLabels = { owner: "Pemilik", student: "Peserta", visitor: "Tamu" };

  async function load(id: string) {
    errorMessage = "";
    const result = await getCourse(id);
    if (result.success) {
      setCourse(result.data.course);
    } else {
      errorMessage = result.message;
    }
  }

  $effect(() => {
    const id = courseId;
    untrack(() => {
      setCourse(null);
      load(id);
    });
  });

  $effect(() => {
    if (Object.values($mutations).some(Boolean)) {
      untrack(() => {
        (Object.keys($mutations) as MutationKey[]).forEach(clearMutation);
        load(courseId);
      });
    }
  });

  async function perform(request: () => Promise<ApiResult>, key: MutationKey) {
    const result = await request();
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    markMutation(key);
    await showSuccessDialog(result.message);
  }

  const handleJoin = () => perform(() => postStudent(courseId), "student");

  async function handleLeave() {
    if (await showConfirmDialog("Keluar dari kursus?", "Progres belajarmu tidak akan lagi ditampilkan.", "Ya, keluar")) {
      await perform(() => deleteStudent(courseId), "student");
    }
  }

  async function handleDeleteCourse() {
    if (!(await showConfirmDialog("Hapus kursus?", "Kursus beserta seluruh materinya akan dihapus permanen.", "Ya, hapus"))) return;
    const result = await deleteCourse(courseId);
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    await showSuccessDialog(result.message);
    await goto("/");
  }

  async function handleDeleteContent(item: CourseContent) {
    if (await showConfirmDialog("Hapus konten?", `Materi "${item.title}" akan dihapus.`, "Ya, hapus")) {
      await perform(() => deleteContent(item.id), "content");
    }
  }

  function handleRate(event: SubmitEvent) {
    event.preventDefault();
    return perform(() => putRatings(courseId, { ratings: Number(ratingValue), comment }), "rating");
  }

  function openContentModal(item: CourseContent | null) {
    editingContent = item;
    showContent = true;
  }
</script>

<svelte:head>
  <title>{`${$course ? $course.title : "Detail Kursus"} · Delcom Courses`}</title>
</svelte:head>

<a href="/" class="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-indigo-800 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-700">
  <ArrowLeft size={16} aria-hidden="true" /> Semua Kursus
</a>

{#if errorMessage}
  <p class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900" role="alert">{errorMessage}</p>
{:else if !$course}
  <div class="flex items-center justify-center gap-3 py-24 text-slate-700" role="status">
    <LoaderCircle class="animate-spin" size={22} aria-hidden="true" />
    <span>Memuat kursus...</span>
  </div>
{:else}
  <article class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="aspect-[16/6] bg-gradient-to-br from-indigo-700 to-indigo-950">
      {#if $course.cover}
        <img src={$course.cover} alt={`Sampul kursus ${$course.title}`} width="1280" height="480" class="h-full w-full object-cover" />
      {:else}
        <span class="grid h-full w-full place-items-center text-white/80" aria-hidden="true"><GraduationCap size={64} /></span>
      {/if}
    </div>

    <div class="p-6 sm:p-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">{$course.title}</h1>
      <p class="mt-1 text-sm text-slate-600">
        {`oleh ${$course.author?.name ?? "Tanpa nama"} · dibuat ${formatDate($course.created_at)}`}
      </p>
      <p class="mt-4 whitespace-pre-line text-slate-800">{$course.description}</p>

      <dl class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-xl bg-slate-100 p-4">
          <dt class="text-xs font-semibold uppercase text-slate-600">Rating</dt>
          <dd class="mt-1 text-xl font-extrabold text-slate-900">{$course.avg_ratings ? Number($course.avg_ratings).toFixed(1) : "-"}</dd>
        </div>
        <div class="rounded-xl bg-slate-100 p-4">
          <dt class="text-xs font-semibold uppercase text-slate-600">Peserta</dt>
          <dd class="mt-1 text-xl font-extrabold text-slate-900">{$course.students.length}</dd>
        </div>
        <div class="rounded-xl bg-slate-100 p-4">
          <dt class="text-xs font-semibold uppercase text-slate-600">Materi</dt>
          <dd class="mt-1 text-xl font-extrabold text-slate-900">{$course.contents.length}</dd>
        </div>
        <div class="rounded-xl bg-slate-100 p-4">
          <dt class="text-xs font-semibold uppercase text-slate-600">Peran</dt>
          <dd class="mt-1 text-xl font-extrabold text-slate-900 capitalize">{roleLabels[role]}</dd>
        </div>
      </dl>

      {#if role === "student"}
        <div class="mt-6">
          <label class="text-sm font-semibold text-slate-800" for="progress">{`Progres belajar: ${$course.my_percentage_finished}%`}</label>
          <progress id="progress" class="mt-2 h-2 w-full accent-indigo-700" max="100" value={Number($course.my_percentage_finished)}></progress>
        </div>
      {/if}

      <div class="mt-6 flex flex-wrap gap-3">
        {#if role === "owner"}
          <button type="button" class={btnSecondary} onclick={() => (showChange = true)}>
            <Pencil size={16} aria-hidden="true" /> Ubah Data
          </button>
          <button type="button" class={btnSecondary} onclick={() => (showCover = true)}>
            <ImageIcon size={16} aria-hidden="true" /> Ubah Sampul
          </button>
          <button type="button" class={btnDanger} onclick={handleDeleteCourse}>
            <Trash2 size={16} aria-hidden="true" /> Hapus Kursus
          </button>
        {:else if role === "student"}
          <button type="button" class={btnSecondary} onclick={handleLeave}>
            <UserMinus size={16} aria-hidden="true" /> Keluar dari Kursus
          </button>
        {:else}
          <button type="button" class={btnPrimary} onclick={handleJoin}>
            <UserPlus size={16} aria-hidden="true" /> Ikuti Kursus
          </button>
        {/if}
      </div>
    </div>
  </article>

  <section class="mt-8" aria-labelledby="contents-heading">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="contents-heading" class="text-2xl font-extrabold text-slate-900">Daftar Materi</h2>
      {#if role === "owner"}
        <button type="button" class={btnPrimary} onclick={() => openContentModal(null)}>
          <Plus size={16} aria-hidden="true" /> Tambah Konten
        </button>
      {/if}
    </div>

    {#if $course.contents.length === 0}
      <p class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-700">Belum ada materi.</p>
    {:else}
      <ol class="mt-4 space-y-3">
        {#each $course.contents as item, index (item.id)}
          <li class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-900">{index + 1}</span>
              {#if canLearn}
                <a href={`/courses/${$course.id}/contents/${item.id}`} class="flex min-w-0 items-center gap-2 font-semibold text-slate-900 hover:text-indigo-800">
                  <Video size={16} aria-hidden="true" /><span class="truncate">{item.title}</span>
                </a>
              {:else}
                <span class="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
                  <Lock size={16} aria-hidden="true" /><span class="truncate">{item.title}</span>
                  <span class="sr-only">(ikuti kursus untuk membuka)</span>
                </span>
              {/if}
              {#if item.my_status_finished}
                <span class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                  <CircleCheck size={16} aria-hidden="true" /> Selesai
                </span>
              {/if}
            </div>
            {#if role === "owner"}
              <div class="flex gap-2">
                <button type="button" class={btnSecondary} aria-label={`Ubah konten ${item.title}`} onclick={() => openContentModal(item)}>
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button type="button" class={btnDanger} aria-label={`Hapus konten ${item.title}`} onclick={() => handleDeleteContent(item)}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}
  </section>

  <section class="mt-8" aria-labelledby="ratings-heading">
    <h2 id="ratings-heading" class="text-2xl font-extrabold text-slate-900">Rating dan Ulasan</h2>

    {#if role === "student"}
      <form class="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-5" onsubmit={handleRate}>
        <div>
          <label class={labelClass} for="rating-value">Rating (1 sampai 5)</label>
          <select id="rating-value" class={inputClass} bind:value={ratingValue}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label class={labelClass} for="rating-comment">Komentar</label>
          <textarea id="rating-comment" class={inputClass} rows="3" placeholder="Tulis pengalamanmu" required bind:value={comment}></textarea>
        </div>
        <button type="submit" class={btnPrimary}><Star size={16} aria-hidden="true" /> Kirim Rating</button>
      </form>
    {/if}

    {#if $course.ratings.length === 0}
      <p class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-700">Belum ada ulasan.</p>
    {:else}
      <ul class="mt-4 space-y-3">
        {#each $course.ratings as review, index (index)}
          <li class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="flex items-center gap-2 font-semibold text-slate-900">
              {`${review.name}`}
              <span class="inline-flex items-center gap-1 text-sm text-amber-900"><Star size={14} aria-hidden="true" /> {`${review.ratings}/5`}</span>
            </p>
            <p class="mt-1 text-slate-700">{review.comment}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if showChange}
    <ChangeModal course={$course} onClose={() => (showChange = false)} />
  {/if}
  {#if showCover}
    <ChangeCoverModal courseId={$course.id} onClose={() => (showCover = false)} />
  {/if}
  {#if showContent}
    <ContentModal courseId={$course.id} content={editingContent} onClose={() => (showContent = false)} />
  {/if}
{/if}
