import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateRequestRequest, Request } from "@darigo/shared-types";

interface RequestDraftState {
  draft: Partial<CreateRequestRequest>;
  setDraft: (patch: Partial<CreateRequestRequest>) => void;
  clearDraft: () => void;
}

interface RequestState {
  lastRequest: Request | null;
  setLastRequest: (req: Request | null) => void;
}

export const useRequestDraftStore = create<RequestDraftState>()(
  persist(
    (set) => ({
      draft: {},
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      clearDraft: () => set({ draft: {} }),
    }),
    { name: "darigo_request_draft" },
  ),
);

export const useRequestState = create<RequestState>((set) => ({
  lastRequest: null,
  setLastRequest: (req) => set({ lastRequest: req }),
}));
