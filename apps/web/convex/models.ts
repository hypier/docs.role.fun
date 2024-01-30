import { query } from "./_generated/server";
import { imageModelData, modelData, voiceData } from "./constants";

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    return modelData;
  },
});

export const listImageModels = query({
  args: {},
  handler: async (ctx, args) => {
    return imageModelData;
  },
});

export const listVoices = query({
  args: {},
  handler: async (ctx, args) => {
    return voiceData;
  },
});

export const listAllModels = query({
  args: {},
  handler: async (ctx, args) => {
    return [...modelData, ...imageModelData, ...voiceData];
  },
});
