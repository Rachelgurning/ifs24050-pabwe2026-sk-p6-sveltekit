<script lang="ts">
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
  import { putCourse } from "../api/courseApi";
  import CourseForm from "../components/CourseForm.svelte";
  import Modal from "../components/Modal.svelte";
  import { markMutation } from "../states/coursesStore";
  import type { Course } from "../types";

  let { course, onClose }: { course: Course; onClose: () => void } = $props();
  let loading = $state(false);

  async function handleSubmit(title: string, description: string) {
    loading = true;
    const result = await putCourse(course.id, { title, description });
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

<Modal id="change-course" title="Ubah Data Kursus" {onClose}>
  <CourseForm
    id="change-course"
    title={course.title}
    description={course.description}
    submitLabel="Simpan"
    {loading}
    onSubmit={handleSubmit}
    onCancel={onClose}
  />
</Modal>
