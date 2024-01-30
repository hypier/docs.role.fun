import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./users";

export const list = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    return await ctx.db
      .query("hides")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(256);
  },
});

export const insert = mutation({
  args: {
    type: v.string(),
    elementId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    return await ctx.db.insert("hides", {
      type: args.type,
      userId: user._id,
      elementId: args.elementId,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("hides"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const hide = await ctx.db
      .query("hides")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
    if (hide) {
      return await ctx.db.delete(args.id);
    }
  },
});
