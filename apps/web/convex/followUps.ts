import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getUser } from "./users";
import { internal } from "./_generated/api";

export const create = internalMutation({
  args: {
    chatId: v.id("chats"),
    followUp1: v.optional(v.string()),
    followUp2: v.optional(v.string()),
    followUp3: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("followUps", {
      ...args,
      isStale: false,
    });
  },
});

export const update = internalMutation({
  args: {
    followUpId: v.id("followUps"),
    instruction: v.optional(v.string()),
    followUp1: v.optional(v.string()),
    followUp2: v.optional(v.string()),
    followUp3: v.optional(v.string()),
    followUp4: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { followUpId, ...rest } = args;
    return await ctx.db.patch(followUpId, {
      ...rest,
    });
  },
});

export const generate = mutation({
  args: {
    chatId: v.id("chats"),
    characterId: v.id("characters"),
    personaId: v.optional(v.id("personas")),
  },
  handler: async (ctx, { chatId, characterId, personaId }) => {
    const user = await getUser(ctx);
    await ctx.scheduler.runAfter(0, internal.llm.generateFollowups, {
      chatId,
      characterId,
      personaId: personaId ? personaId : user?.primaryPersonaId,
      userId: user._id,
    });
  },
});

export const get = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const followUp = await ctx.db
      .query("followUps")
      .withIndex("byChatId", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();
    return followUp;
  },
});

export const latestFollowup = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const followUp = await ctx.db
      .query("followUps")
      .withIndex("by_creation_time")
      .filter((q) => q.eq(q.field("chatId"), args.chatId))
      .order("desc")
      .first();
    return followUp;
  },
});

export const choose = mutation({
  args: {
    chosen: v.string(),
    query: v.string(),
    followUpId: v.id("followUps"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.followUpId, {
      chosen: args.chosen,
      query: args.query,
    });
  },
});
