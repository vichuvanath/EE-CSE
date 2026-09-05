"use client";

import { create } from "zustand";

interface HodState {
  selectedBatch: string;
  setSelectedBatch: (batch: string) => void;
}

export const useHodStore = create<HodState>((set) => ({
  selectedBatch: "2023-2027",
  setSelectedBatch: (batch: string) => set({ selectedBatch: batch }),
}));
