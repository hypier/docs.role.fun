import { query } from "./_generated/server";
import { imageModelData, modelData } from "./constants";

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
