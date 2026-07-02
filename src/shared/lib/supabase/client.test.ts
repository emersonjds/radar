import { describe, it, expect } from "vitest";
import { getSupabaseBrowserClient } from "./client";

describe("getSupabaseBrowserClient", () => {
  it("returns the same instance on repeated calls", () => {
    expect(getSupabaseBrowserClient()).toBe(getSupabaseBrowserClient());
  });
});
