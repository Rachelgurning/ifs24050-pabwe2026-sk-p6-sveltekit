import { writable } from "svelte/store";
import type { UserProfile } from "../types";

export const users = writable<UserProfile[]>([]);

export const setUsers = (value: UserProfile[]) => users.set(value);
