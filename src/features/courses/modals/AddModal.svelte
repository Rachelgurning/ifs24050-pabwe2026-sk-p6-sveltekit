<script lang="ts">
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
  import { postCourse } from "../api/courseApi";
  import CourseForm from "../components/CourseForm.svelte";
  import Modal from "../components/Modal.svelte";
  import { markMutation } from "../states/coursesStore";

  let { onClose }: { onClose: () => void } = $props();
  let loading = $state(false);

  async function handleSubmit(title: string, description: string) {
    loading = true;
    const result = await postCourse({ title, description });
    loading = false;
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    markMutation("course");
    onClose();
    await showSuccessDialog(result.message);
  }
</script>

<Modal id="add-course" title="Tambah Kursus" {onClose}>
  <CourseForm id="add-course" submitLabel="Tambah" {loading} onSubmit={handleSubmit} onCancel={onClose} />
</Modal>
