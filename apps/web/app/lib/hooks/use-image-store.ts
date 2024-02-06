import create from "zustand";
import { Id } from "../../../convex/_generated/dataModel";

type ImageState = {
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  imageId: Id<"images">;
  setImageId: (imageId: Id<"images">) => void;
};

export const useImageStore = create<ImageState>((set) => ({
  isGenerating: false,
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
  imageId: "" as Id<"images">,
  setImageId: (imageId: Id<"images">) => set({ imageId }),
}));
