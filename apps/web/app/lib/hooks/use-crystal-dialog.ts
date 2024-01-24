import { create } from "zustand";

type CrystalDialogState = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

export const useCrystalDialog = create<CrystalDialogState>()((set) => ({
  isOpen: false,
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}));
