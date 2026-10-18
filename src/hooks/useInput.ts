import { writable, type Writable } from "svelte/store";

export interface InputHook<T> {
  value: Writable<T>;
  onChange: (event: Event) => void;
  reset: () => void;
}

/** Hook input formulir berbasis store Svelte. */
export function useInput<T = string>(initialValue: T): InputHook<T> {
  const value = writable<T>(initialValue);

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value.set(target.value as unknown as T);
  };

  const reset = () => value.set(initialValue);

  return { value, onChange, reset };
}
