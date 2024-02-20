import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

export const upsert = mutation({
  args: {
    characterId: v.id("characters"),
    model: v.string(),
  },
  handler: async (ctx, { characterId, model }) => {
    const user = await getUser(ctx);
    const existingCustomization = await ctx.db
      .query("characterCustomizations")
      .withIndex("byUserId", (q) => q.eq("userId", user?._id as Id<"users">))
      .filter((q) => q.eq(q.field("characterId"), characterId))
      .first();
    if (existingCustomization) {
      await ctx.db.patch(existingCustomization._id, { model });
    } else {
      await ctx.db.insert("characterCustomizations", {
        characterId,
        model,
        userId: user?._id,
      });
    }
  },
});

export const get = query({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    const customization = await ctx.db
      .query("characterCustomizations")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("characterId"), characterId))
      .first();
    return customization;
  },
});
