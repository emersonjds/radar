import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn();
vi.mock("next/navigation", () => ({ redirect: (path: string) => redirect(path) }));

describe("Home", () => {
  it("redirects to /login", async () => {
    const { default: Home } = await import("./page");
    Home();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
