import { create } from "zustand";

type VoiceOverState = {
  isVoicePlaying: boolean;
  playVoice: () => void;
  stopVoice: () => void;
};

export const useVoiceOver = create<VoiceOverState>((set) => ({
  isVoicePlaying: false,
  playVoice: () => set(() => ({ isVoicePlaying: true })),
  stopVoice: () => set(() => ({ isVoicePlaying: false })),
}));
