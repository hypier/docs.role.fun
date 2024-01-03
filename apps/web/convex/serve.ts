import { ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCrystalPrice } from "./constants";
import { Id } from "./_generated/dataModel";
import { getUser } from "./users";

export const useCrystal = internalMutation(
  async (ctx, { userId, name }: { userId: Id<"users">; name: string }) => {
    const user = await ctx.db.get(userId);
    const price = getCrystalPrice(name);
    const currentCrystals = user?.crystals || 0;
    if (currentCrystals - price < 0) {
      throw new ConvexError(
        `Not enough crystals. You need ${price} crystals to use ${name}.`
      );
    }
    await ctx.db.patch(userId, { crystals: currentCrystals - price });
    await ctx.db.insert("usage", {
      userId,
      name,
    });
    return { currentCrystals, remainingCrystals: currentCrystals - price };
  }
);

export const refundCrystal = internalMutation(
  async (
    ctx,
    {
      userId,
      name,
      currentCrystals,
    }: { userId: Id<"users">; name: string; currentCrystals: number }
  ) => {
    await ctx.db.patch(userId, { crystals: currentCrystals });
    await ctx.db.insert("usage", {
      userId,
      name: name + "-refund",
    });
  }
);

export const checkedIn = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const date = new Date().toISOString().split("T")[0];
    const checkIn = await ctx.db
      .query("checkIn")
      .withIndex("byUserId", (q: any) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("date"), date))
      .first();

    if (checkIn) return true;
    return false;
  },
});

export const checkin = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const date = new Date().toISOString().split("T")[0] as string;
    const checkIn = await ctx.db
      .query("checkIn")
      .withIndex("byUserId", (q: any) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("date"), date))
      .first();
    console.log("checkIn:", checkIn);
    if (checkIn) throw new ConvexError("You've already checked in today.");
    await ctx.db.insert("checkIn", {
      userId: user._id as Id<"users">,
      date,
    });
    const currentCrystals = user?.crystals || 0;
    await ctx.db.patch(user._id, { crystals: currentCrystals + 50 });
  },
});
