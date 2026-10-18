<script lang="ts">
  import { GraduationCap, Star, Trash2, Users, Video } from "lucide-svelte";
  import { cn } from "../../common/ui";
  import { isOwner, isStudent } from "../states/coursesStore";
  import type { Course } from "../types";

  let {
    course,
    myId,
    onDelete,
  }: { course: Course; myId: number | undefined; onDelete: (course: Course) => void } = $props();

  const owner = $derived(isOwner(course, myId));
  const student = $derived(isStudent(course, myId));
  const rating = $derived(course.avg_ratings ? Number(course.avg_ratings).toFixed(1) : "Belum ada rating");
</script>

<article class="group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
  <div class="relative aspect-video bg-gradient-to-br from-indigo-700 to-indigo-950">
    {#if course.cover}
      <img
        src={course.cover}
        alt=""
        width="640"
        height="360"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover"
      />
    {:else}
      <span class="grid h-full w-full place-items-center text-white/80" aria-hidden="true">
        <GraduationCap size={48} />
      </span>
    {/if}
    {#if owner || student}
      <span
        class={cn(
          "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold",
          owner ? "bg-amber-200 text-amber-950" : "bg-emerald-200 text-emerald-950"
        )}
      >
        {owner ? "Milik saya" : "Terdaftar"}
      </span>
    {/if}
  </div>

  <div class="flex flex-1 flex-col p-5">
    <h2 class="text-lg font-bold leading-snug text-slate-900">
      <a href={`/courses/${course.id}`} class="hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-indigo-700">
        {course.title}
      </a>
    </h2>
    <p class="mt-1 text-sm text-slate-600">{`oleh ${course.author?.name ?? "Tanpa nama"}`}</p>
    <p class="mt-3 line-clamp-2 text-sm text-slate-700">{course.description}</p>

    <dl class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
      <div class="flex items-center gap-1.5">
        <dt class="sr-only">Materi</dt>
        <Video size={16} aria-hidden="true" /><dd>{`${course.total_contents ?? 0} materi`}</dd>
      </div>
      <div class="flex items-center gap-1.5">
        <dt class="sr-only">Peserta</dt>
        <Users size={16} aria-hidden="true" /><dd>{`${course.students.length} peserta`}</dd>
      </div>
      <div class="flex items-center gap-1.5">
        <dt class="sr-only">Rating</dt>
        <Star size={16} aria-hidden="true" /><dd>{rating}</dd>
      </div>
    </dl>

    {#if owner}
      <div class="mt-auto pt-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"
          aria-label={`Hapus kursus ${course.title}`}
          onclick={() => onDelete(course)}
        >
          <Trash2 size={16} aria-hidden="true" /> Hapus
        </button>
      </div>
    {/if}
  </div>
</article>
