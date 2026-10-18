<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { X } from "lucide-svelte";

  let {
    id,
    title,
    onClose,
    children,
  }: { id: string; title: string; onClose: () => void; children: Snippet } = $props();

  let dialog: HTMLDivElement;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
  }

  onMount(() => {
    const previous = document.activeElement as HTMLElement;
    (dialog.querySelector("input, textarea, select") as HTMLElement).focus();
    return () => previous.focus();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-40 grid place-items-center p-4">
  <button
    type="button"
    class="absolute inset-0 cursor-default bg-slate-900/60"
    tabindex="-1"
    aria-label="Tutup dialog"
    data-testid="modal-backdrop"
    onclick={onClose}
  ></button>
  <div
    bind:this={dialog}
    role="dialog"
    aria-modal="true"
    aria-labelledby={`${id}-title`}
    class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
  >
    <div class="mb-5 flex items-start justify-between gap-4">
      <h2 id={`${id}-title`} class="text-xl font-extrabold text-slate-900">{`${title}`}</h2>
      <button
        type="button"
        class="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-700"
        aria-label="Tutup"
        onclick={onClose}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </div>
    {@render children()}
  </div>
</div>
