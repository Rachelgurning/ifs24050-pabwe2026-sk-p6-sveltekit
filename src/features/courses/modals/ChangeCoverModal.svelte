<script lang="ts">
  import {
    showErrorDialog,
    showSuccessDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper";
  import { btnPrimary, btnSecondary, inputClass, labelClass } from "../../common/ui";
  import { postCourseCover } from "../api/courseApi";
  import Modal from "../components/Modal.svelte";
  import { markMutation } from "../states/coursesStore";

  let { courseId, onClose }: { courseId: number; onClose: () => void } = $props();

  let input: HTMLInputElement;
  let loading = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const file = input.files[0];
    if (!file) {
      await showWarningDialog("Pilih berkas gambar terlebih dahulu.");
      return;
    }
    loading = true;
    const result = await postCourseCover(courseId, file);
    loading = false;
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    markMutation("cover");
    onClose();
    await showSuccessDialog(result.message);
  }
</script>

<Modal id="change-cover" title="Ubah Sampul Kursus" {onClose}>
  <form class="space-y-5" onsubmit={handleSubmit}>
    <div>
      <label class={labelClass} for="cover-input">Berkas gambar</label>
      <input
        id="cover-input"
        bind:this={input}
        class={inputClass}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        required
      />
      <p class="mt-1.5 text-sm text-slate-600">Gunakan gambar berformat JPG, PNG, atau WebP.</p>
    </div>
    <div class="flex justify-end gap-3">
      <button type="button" class={btnSecondary} onclick={onClose}>Batal</button>
      <button type="submit" class={btnPrimary} disabled={loading}>
        {loading ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  </form>
</Modal>
