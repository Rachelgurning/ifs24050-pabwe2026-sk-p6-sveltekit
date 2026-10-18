<script lang="ts">
  import { btnPrimary, btnSecondary, inputClass, labelClass } from "../../common/ui";

  let {
    id,
    title = "",
    description = "",
    submitLabel,
    loading,
    onSubmit,
    onCancel,
  }: {
    id: string;
    title?: string;
    description?: string;
    submitLabel: string;
    loading: boolean;
    onSubmit: (title: string, description: string) => void;
    onCancel: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let titleValue = $state(title);
  // svelte-ignore state_referenced_locally
  let descriptionValue = $state(description);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    onSubmit(titleValue, descriptionValue);
  }
</script>

<form class="space-y-5" onsubmit={handleSubmit}>
  <div>
    <label class={labelClass} for={`${id}-title-input`}>Judul kursus</label>
    <input
      id={`${id}-title-input`}
      class={inputClass}
      type="text"
      placeholder="Contoh: Belajar SvelteKit dari Nol"
      required
      bind:value={titleValue}
    />
  </div>
  <div>
    <label class={labelClass} for={`${id}-description-input`}>Deskripsi</label>
    <textarea
      id={`${id}-description-input`}
      class={inputClass}
      rows="4"
      placeholder="Jelaskan apa yang akan dipelajari"
      required
      bind:value={descriptionValue}
    ></textarea>
  </div>
  <div class="flex justify-end gap-3">
    <button type="button" class={btnSecondary} onclick={onCancel}>Batal</button>
    <button type="submit" class={btnPrimary} disabled={loading}>
      {loading ? "Menyimpan..." : submitLabel}
    </button>
  </div>
</form>
