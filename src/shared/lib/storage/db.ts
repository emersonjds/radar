import { seedDb } from "./seed";

/**
 * Temporary data layer: a single versioned JSON blob in localStorage
 * (key `radar.db.v1`). The async signatures mirror a future Supabase adapter,
 * so entity fetchers won't change when the backend lands. Not for production PII.
 */
const STORAGE_KEY = "radar.db.v1";

export type Collection =
  | "perfis"
  | "turmas"
  | "alunos"
  | "chamadas"
  | "presencas"
  | "avaliacoes"
  | "notas";

export type Db = Record<Collection, unknown[]>;

/** In-memory fallback for SSR and test environments without persistence. */
let memory: Db | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function load(): Db {
  if (hasLocalStorage()) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as Db;
      } catch {
        // Corrupt blob — fall through and reseed.
      }
    }
    const seeded = seedDb();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  if (!memory) memory = seedDb();
  return memory;
}

function persist(db: Db): void {
  if (hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } else {
    memory = db;
  }
}

/** Read a collection as detached copies, so callers can't mutate the store.
    A blob persisted before a collection existed yields [] (light migration). */
export async function readCollection<T>(name: Collection): Promise<T[]> {
  return ((load()[name] ?? []) as T[]).map((row) => ({ ...row }));
}

/** Apply a pure transform to a collection and persist the result. */
export async function mutateCollection<T>(
  name: Collection,
  transform: (rows: T[]) => T[],
): Promise<T[]> {
  const db = load();
  const next = transform((db[name] ?? []) as T[]);
  persist({ ...db, [name]: next });
  return next.map((row) => ({ ...row }));
}

/** Clear persisted data (tests, "reset demo"). */
export async function resetDb(): Promise<void> {
  memory = null;
  if (hasLocalStorage()) window.localStorage.removeItem(STORAGE_KEY);
}
