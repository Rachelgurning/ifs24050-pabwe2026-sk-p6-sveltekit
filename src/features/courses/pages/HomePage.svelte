<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { LoaderCircle, Plus, Search, Trash2 } from "lucide-svelte";
  import {
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";
  import { myId } from "../../auth/states/authStore";
  import { btnDanger, btnPrimary, inputClass } from "../../common/ui";
  import { deleteAllCourses, deleteCourse, getCourses } from "../api/courseApi";
  import CourseCard from "../components/CourseCard.svelte";
  import AddModal from "../modals/AddModal.svelte";
  import {
    clearMutation,
    courses,
    isOwner,
    markMutation,
    mutations,
    setCourses,
  } from "../states/coursesStore";
  import type { Course } from "../types";

  let search = $state("");
  let mineOnly = $state(false);
  let loading = $state(true);
  let errorMessage = $state("");
  let showAdd = $state(false);

  const filtered = $derived(
    $courses.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase())
    )
  );
  const ownedCount = $derived($courses.filter((item) => isOwner(item, $myId)).length);

  async function load() {
    loading = true;
    errorMessage = "";
    const result = await getCourses(mineOnly);
    if (result.success) {
      setCourses(result.data.courses);
    } else {
      errorMessage = result.message;
    }
    loading = false;
  }

  onMount(load);

  $effect(() => {
    if ($mutations.course) {
      untrack(() => {
        clearMutation("course");
        load();
      });
    }
  });

  async function handleDelete(item: Course) {
    if (!(await showConfirmDialog("Hapus kursus?", `Kursus "${item.title}" akan dihapus permanen.`, "Ya, hapus"))) return;
    const result = await deleteCourse(item.id);
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    markMutation("course");
    await showSuccessDialog(result.message);
  }

  async function handleDeleteAll() {
    if (
      !(await showConfirmDialog(
        "Hapus semua kursus saya?",
        "Seluruh kursus yang kamu buat beserta materinya akan dihapus permanen.",
        "Ya, hapus semua"
      ))
    )
      return;
    const result = await deleteAllCourses();
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    markMutation("course");
    await showSuccessDialog(result.message);
  }
</script>

<svelte:head>
  <title>Semua Kursus · Delcom Courses</title>
</svelte:head>

<div class="flex flex-wrap items-end justify-between gap-4">
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Semua Kursus</h1>
    <p class="mt-1 text-slate-700">Temukan kursus untuk dipelajari atau kelola kursus milikmu.</p>
  </div>
  <div class="flex flex-wrap gap-2">
    {#if ownedCount > 0}
      <button type="button" class={btnDanger} onclick={handleDeleteAll}>
        <Trash2 size={16} aria-hidden="true" /> Hapus Semua Milik Saya
      </button>
    {/if}
    <button type="button" class={btnPrimary} onclick={() => (showAdd = true)}>
      <Plus size={16} aria-hidden="true" /> Tambah Kursus
    </button>
  </div>
</div>

<div class="mt-6 flex flex-wrap items-center gap-4">
  <div class="relative min-w-60 flex-1">
    <label class="sr-only" for="course-search">Cari kursus</label>
    <Search class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-600" size={18} aria-hidden="true" />
    <input
      id="course-search"
      class={`${inputClass} pl-10`}
      type="search"
      placeholder="Cari judul atau deskripsi kursus"
      bind:value={search}
    />
  </div>
  <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
    <input
      type="checkbox"
      class="h-4 w-4 accent-indigo-700"
      checked={mineOnly}
      onchange={(event) => {
        mineOnly = event.currentTarget.checked;
        load();
      }}
    />
    Milik saya
  </label>
</div>

<section class="mt-8" aria-label="Daftar kursus">
  {#if loading}
    <div class="flex items-center justify-center gap-3 py-20 text-slate-700" role="status">
      <LoaderCircle class="animate-spin" size={22} aria-hidden="true" />
      <span>Memuat kursus...</span>
    </div>
  {:else if errorMessage}
    <p class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900" role="alert">{errorMessage}</p>
  {:else if filtered.length === 0}
    <p class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-700">
      Belum ada kursus yang cocok.
    </p>
  {:else}
    <ul class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as item (item.id)}
        <li class="flex"><CourseCard course={item} myId={$myId} onDelete={handleDelete} /></li>
      {/each}
    </ul>
  {/if}
</section>

{#if showAdd}
  <AddModal onClose={() => (showAdd = false)} />
{/if}
