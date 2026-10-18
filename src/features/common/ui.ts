import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Menggabungkan kelas Tailwind tanpa duplikasi. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const inputClass =
  "block w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-500 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/40";

export const labelClass = "mb-1.5 block text-sm font-semibold text-slate-800";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = `${btnBase} bg-indigo-700 text-white hover:bg-indigo-800`;
export const btnSecondary = `${btnBase} border border-slate-400 bg-white text-slate-800 hover:bg-slate-100`;
export const btnDanger = `${btnBase} bg-red-700 text-white hover:bg-red-800`;
export const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";
