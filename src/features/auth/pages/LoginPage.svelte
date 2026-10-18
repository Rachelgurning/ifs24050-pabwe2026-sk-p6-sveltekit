<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { putAccessToken } from "../../../helpers/apiHelper";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import { btnPrimary, inputClass, labelClass } from "../../common/ui";
  import { postLogin } from "../api/authApi";
  import { loadProfile } from "../states/authStore";

  let { onSuccess }: { onSuccess: () => void } = $props();

  const { value: email, onChange: onEmail } = useInput("");
  const { value: password, onChange: onPassword } = useInput("");
  let loading = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    const result = await postLogin({ email: $email, password: $password });
    if (!result.success) {
      loading = false;
      await showErrorDialog(result.message);
      return;
    }
    putAccessToken(result.data.token);
    if (await loadProfile()) {
      onSuccess();
    } else {
      loading = false;
      await showErrorDialog("Profil pengguna tidak dapat dimuat.");
    }
  }
</script>

<svelte:head>
  <title>Masuk · Delcom Courses</title>
</svelte:head>

<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Masuk</h1>
<p class="mt-2 text-slate-700">Lanjutkan belajar dengan akun Delcom kamu.</p>

<form class="mt-8 space-y-5" onsubmit={handleSubmit}>
  <div>
    <label class={labelClass} for="login-email-input">Email</label>
    <input
      id="login-email-input"
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
    <label class={labelClass} for="login-password-input">Kata sandi</label>
    <input
      id="login-password-input"
      class={inputClass}
      type="password"
      autocomplete="current-password"
      placeholder="Masukkan kata sandi"
      required
      value={$password}
      oninput={onPassword}
    />
  </div>
  <button id="login-submit-button" class={`${btnPrimary} w-full`} type="submit" disabled={loading}>
    {loading ? "Memproses..." : "Masuk"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-700">
  Belum punya akun?
  <a class="font-semibold text-indigo-700 underline hover:text-indigo-900" href="/auth/register">Daftar sekarang</a>
</p>
