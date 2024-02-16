import { query } from "./_generated/server";

export const listImages = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("images")
      .withIndex("by_creation_time")
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isNSFW"), true))
      .filter((q) => q.neq(q.field("imageUrl"), ""))
      .filter((q) => q.neq(q.field("isPrivate"), true))
      .order("desc")
      .take(500);
  },
});
