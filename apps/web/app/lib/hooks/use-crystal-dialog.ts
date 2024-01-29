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

type PaymentDialogState = {
  isOpen: boolean;
  clientSecret: string;
  openDialog: () => void;
  closeDialog: () => void;
  setClientSecret: (clientSecret: string) => void;
};

export const usePaymentDialog = create<PaymentDialogState>()((set) => ({
  isOpen: false,
  clientSecret: "",
  openDialog: () => set((state) => ({ ...state, isOpen: true })),
  closeDialog: () => set((state) => ({ ...state, isOpen: false })),
  setClientSecret: (clientSecret: string) =>
    set((state) => ({ ...state, clientSecret })),
}));
