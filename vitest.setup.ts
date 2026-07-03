import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./src/test/msw/server";

// No HTTP happens today (data lives in localStorage) — "bypass" instead of
// "error" so unmocked requests don't fail tests unrelated to MSW.
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

afterEach(() => {
  cleanup();
  if (typeof localStorage !== "undefined") localStorage.clear();
});
