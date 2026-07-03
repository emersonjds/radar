"use client";

import { useSyncExternalStore } from "react";
import { papelSchema, type Papel } from "@/entities/perfil/model";

/**
 * Mock session: which persona is using the app. Persisted in localStorage
 * (`radar.sessao`) and read via useSyncExternalStore so it's hydration-safe
 * (server + first client render use the default) and cross-tab aware.
 * Replace with real Supabase auth later.
 */
const STORAGE_KEY = "radar.sessao";
const PADRAO: Papel = "professor";

const listeners = new Set<() => void>();

function lerPapel(): Papel {
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY);
    const parsed = papelSchema.safeParse(bruto);
    return parsed.success ? parsed.data : PADRAO;
  } catch {
    return PADRAO;
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

export function setPapel(papel: Papel): void {
  window.localStorage.setItem(STORAGE_KEY, papel);
  listeners.forEach((listener) => listener());
}

export function usePapel(): Papel {
  return useSyncExternalStore(subscribe, lerPapel, () => PADRAO);
}
