import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCrystalPrice, getImageModelCrystalPrice } from "./constants";

export const price = query({
  args: {
    modelName: v.string(),
  },
  handler: async (ctx, args) => {
    return getCrystalPrice(args.modelName);
  },
});

export const imageModelPrice = query({
  args: {
    modelName: v.string(),
  },
  handler: async (ctx, args) => {
    return getImageModelCrystalPrice(args.modelName);
  },
});
