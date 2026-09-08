import { create } from "zustand";

interface UiState {
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileDrawerOpen: false,
  setMobileDrawerOpen: (open: boolean) => set({ mobileDrawerOpen: open }),
}));
