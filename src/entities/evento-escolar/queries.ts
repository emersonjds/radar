"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEventosEscolares } from "./api";

export const eventoEscolarKeys = {
  all: ["eventosEscolares"],
};

export function useEventosEscolares() {
  return useQuery({ queryKey: eventoEscolarKeys.all, queryFn: fetchEventosEscolares });
}
