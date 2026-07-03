import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, type RenderHookResult } from "@testing-library/react";
import type { ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/** Fresh, isolated QueryClient per call — no cache bleed between tests. */
export function renderHookComQuery<TResult>(
  callback: () => TResult,
): RenderHookResult<TResult, unknown> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: QueryProviderProps) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return renderHook(callback, { wrapper: Wrapper });
}
