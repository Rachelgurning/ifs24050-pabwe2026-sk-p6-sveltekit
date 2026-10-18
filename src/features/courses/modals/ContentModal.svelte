<script lang="ts">
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
  import { btnPrimary, btnSecondary, inputClass, labelClass } from "../../common/ui";
  import { postContent, putContent } from "../api/courseApi";
  import Modal from "../components/Modal.svelte";
  import { markMutation } from "../states/coursesStore";
  import type { CourseContent } from "../types";

  let {
    courseId,
    content = null,
    onClose,
  }: { courseId: number; content?: CourseContent | null; onClose: () => void } = $props();

  // svelte-ignore state_referenced_locally
  let title = $state(content ? content.title : "");
  // svelte-ignore state_referenced_locally
  let youtube = $state(content ? content.youtube : "");
  let loading = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    const payload = { title, youtube };
    const result = content
      ? await putContent(content.id, payload)
      : await postContent(courseId, payload);
    loading = false;
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    markMutation("content");
    onClose();
    await showSuccessDialog(result.message);
  }
</script>

<Modal id="content" title={content ? "Ubah Konten" : "Tambah Konten"} {onClose}>
  <form class="space-y-5" onsubmit={handleSubmit}>
    <div>
      <label class={labelClass} for="content-title-input">Judul materi</label>
      <input
        id="content-title-input"
        class={inputClass}
        type="text"
        placeholder="Contoh: Pengenalan Svelte"
        required
        bind:value={title}
      />
    </div>
    <div>
      <label class={labelClass} for="content-youtube-input">Tautan YouTube</label>
      <input
        id="content-youtube-input"
        class={inputClass}
        type="url"
        placeholder="https://youtu.be/..."
        required
        bind:value={youtube}
      />
    </div>
    <div class="flex justify-end gap-3">
      <button type="button" class={btnSecondary} onclick={onClose}>Batal</button>
      <button type="submit" class={btnPrimary} disabled={loading}>
        {loading ? "Menyimpan..." : content ? "Simpan" : "Tambah"}
      </button>
    </div>
  </form>
</Modal>
