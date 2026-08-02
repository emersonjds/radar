import { http, HttpResponse } from "msw";

/**
 * Dormant today: data comes from the localStorage store (see
 * src/shared/lib/storage/db.ts), not HTTP. This handler documents the REST
 * shape the future Supabase adapter will use, so it's ready when the
 * fetchers in entities/*\/api.ts swap to real requests. `onUnhandledRequest`
 * is set to "bypass" in vitest.setup.ts because nothing calls fetch yet.
 */
export const handlers = [http.get("*/rest/v1/turmas", () => HttpResponse.json([]))];
