<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
  import { btnPrimary, inputClass, labelClass } from "../../common/ui";
  import { postRegister } from "../api/authApi";

  let { onSuccess }: { onSuccess: () => void } = $props();

  const { value: name, onChange: onName } = useInput("");
  const { value: email, onChange: onEmail } = useInput("");
  const { value: password, onChange: onPassword } = useInput("");
  let loading = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    const result = await postRegister({ name: $name, email: $email, password: $password });
    loading = false;
    if (!result.success) {
      await showErrorDialog(result.message);
      return;
    }
    await showSuccessDialog(result.message);
    onSuccess();
  }
</script>

<svelte:head>
  <title>Daftar · Delcom Courses</title>
</svelte:head>

<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Buat akun</h1>
<p class="mt-2 text-slate-700">Daftar gratis dan mulai belajar atau mengajar.</p>

<form class="mt-8 space-y-5" onsubmit={handleSubmit}>
  <div>
    <label class={labelClass} for="register-name">Nama lengkap</label>
    <input
      id="register-name"
      class={inputClass}
      type="text"
      autocomplete="name"
      placeholder="Nama lengkap"
      required
      value={$name}
      oninput={onName}
    />
  </div>
  <div>
    <label class={labelClass} for="register-email">Email</label>
    <input
      id="register-email"
      class={inputClass}
      type="email"
      autocomplete="email"
      placeholder="nama@email.com"
      required
      value={$email}
      oninput={onEmail}
    />
  </div>
  <div>
    <label class={labelClass} for="register-password">Kata sandi</label>
    <input
      id="register-password"
      class={inputClass}
      type="password"
      autocomplete="new-password"
      placeholder="Minimal 6 karakter"
      minlength="6"
      required
      value={$password}
      oninput={onPassword}
    />
  </div>
  <button class={`${btnPrimary} w-full`} type="submit" disabled={loading}>
    {loading ? "Memproses..." : "Daftar"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-700">
  Sudah punya akun?
  <a class="font-semibold text-indigo-700 underline hover:text-indigo-900" href="/auth/login">Masuk</a>
</p>
