"use client";

import { useSyncExternalStore } from "react";
import { roleSchema, type Role } from "@/entities/profile/model";

/**
 * Mock session: which persona is using the app. Persisted in localStorage
 * (`radar.session`) and read via useSyncExternalStore so it's hydration-safe
 * (server + first client render use the default) and cross-tab aware.
 * Replace with real Supabase auth later.
 */
const STORAGE_KEY = "radar.session";
const DEFAULT_ROLE: Role = "teacher";

const listeners = new Set<() => void>();

function readRole(): Role {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = roleSchema.safeParse(raw);
    return parsed.success ? parsed.data : DEFAULT_ROLE;
  } catch {
    return DEFAULT_ROLE;
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function setRole(role: Role): void {
  window.localStorage.setItem(STORAGE_KEY, role);
  listeners.forEach((listener) => listener());
}

export function useRole(): Role {
  return useSyncExternalStore(subscribe, readRole, () => DEFAULT_ROLE);
}
