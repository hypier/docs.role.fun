import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUser } from "./users";
import { internal } from "./_generated/api";

export const subscription = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const payment = await ctx.db
      .query("payments")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("subscriptionId"), ""))
      .filter((q) => q.eq(q.field("isPurchased"), true))
      .order("desc")
      .first();
    const currentDate = new Date();
    const oneMonthAgo = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1),
    );
    if (
      payment?.cancelsAt &&
      Date.parse(payment.cancelsAt) < oneMonthAgo.getTime()
    ) {
      payment.cancelsAt = "";
    }
    return payment;
  },
});

export const create = internalMutation({
  handler: async (
    ctx,
    { numCrystals, userId }: { numCrystals: number; userId: Id<"users"> },
  ) => {
    return await ctx.db.insert("payments", { numCrystals, userId });
  },
});

export const markPending = internalMutation({
  args: { paymentId: v.id("payments"), stripeId: v.string() },
  handler: async (ctx, { paymentId, stripeId }) => {
    await ctx.db.patch(paymentId, { stripeId });
  },
});

export const fulfill = internalMutation({
  args: { stripeId: v.string() },
  handler: async (ctx, { stripeId }) => {
    const {
      userId,
      numCrystals,
      _id: paymentId,
    } = (await ctx.db
      .query("payments")
      .withIndex("byStripeId", (q) => q.eq("stripeId", stripeId))
      .unique())!;
    const user = await ctx.db.get(userId as Id<"users">);
    const currentCrystals = user?.crystals || 0;
    await ctx.db.patch(userId as Id<"users">, {
      crystals: currentCrystals + numCrystals,
    });
    await ctx.db.patch(paymentId, {
      isPurchased: true,
    });
  },
});

export const fulfillSubscription = internalMutation({
  args: { stripeId: v.string(), subscriptionId: v.string() },
  handler: async (ctx, { stripeId, subscriptionId }) => {
    const {
      userId,
      numCrystals,
      _id: paymentId,
    } = (await ctx.db
      .query("payments")
      .withIndex("byStripeId", (q) => q.eq("stripeId", stripeId))
      .unique())!;
    const user = await ctx.db.get(userId as Id<"users">);
    const currentCrystals = user?.crystals || 0;
    await ctx.db.patch(userId as Id<"users">, {
      crystals: currentCrystals + numCrystals,
    });
    await ctx.db.patch(paymentId, {
      isPurchased: true,
      subscriptionId,
    });
    await ctx.db.patch(userId, {
      subscriptionTier: "plus",
    });
  },
});

export const updateSubscription = internalMutation({
  args: {
    tier: v.optional(v.union(v.literal("free"), v.literal("plus"))),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, { tier = "plus", subscriptionId }) => {
    const { userId } = (await ctx.db
      .query("payments")
      .withIndex("bySubscriptionId", (q) =>
        q.eq("subscriptionId", subscriptionId),
      )
      .unique())!;
    await ctx.db.patch(userId, {
      subscriptionTier: tier,
    });
  },
});

export const deleteSubscription = internalMutation({
  args: {
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, { subscriptionId }) => {
    const { userId } = (await ctx.db
      .query("payments")
      .withIndex("bySubscriptionId", (q) =>
        q.eq("subscriptionId", subscriptionId),
      )
      .unique())!;
    await ctx.db.patch(userId, {
      subscriptionTier: "free",
    });
  },
});

export const cancelSubscription = internalMutation({
  args: {
    subscriptionId: v.optional(v.string()),
    cancelsAt: v.string(),
  },
  handler: async (ctx, { subscriptionId, cancelsAt }) => {
    const { _id } = (await ctx.db
      .query("payments")
      .withIndex("bySubscriptionId", (q) =>
        q.eq("subscriptionId", subscriptionId),
      )
      .unique())!;
    await ctx.db.patch(_id, {
      cancelsAt,
    });
  },
});

export const getSubscriptionId = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const { subscriptionId } = (await ctx.db
      .query("payments")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("subscriptionId"), ""))
      .filter((q) => q.eq(q.field("isPurchased"), true))
      .order("desc")
      .first())!;
    return subscriptionId;
  },
});

export const unsubscribe = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    ctx.scheduler.runAfter(0, internal.stripe.unsubscribe, {
      userId: user?._id,
    });
  },
});

export const uncancel = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    ctx.scheduler.runAfter(0, internal.stripe.uncancel, {
      userId: user?._id,
    });
  },
});
