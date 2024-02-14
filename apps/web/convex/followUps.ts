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
    followUp1: v.optional(v.string()),
    followUp2: v.optional(v.string()),
    followUp3: v.optional(v.string()),
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
    const chat = await ctx.db.get(args.chatId);
    if (chat) {
      const followUp = await ctx.db
        .query("followUps")
        .withIndex("byChatId", (q) => q.eq("chatId", args.chatId))
        .order("desc")
        .first();
      console.log("followUp::", followUp);
      return followUp;
    }
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
    console.log("followUp::", followUp);
    return followUp;
  },
});

export const autopilot = mutation({
  args: {
    chatId: v.id("chats"),
    characterId: v.id("characters"),
    personaId: v.optional(v.id("personas")),
  },
  handler: async (ctx, { chatId, characterId, personaId }) => {
    const user = await getUser(ctx);
    await ctx.scheduler.runAfter(0, internal.llm.answer, {
      chatId,
      characterId,
      personaId: personaId ? personaId : user?.primaryPersonaId,
      userId: user._id,
      reverseRole: true,
    });
    const character = await ctx.db.get(characterId);
    const updatedAt = new Date().toISOString();
    await ctx.db.patch(characterId, {
      numChats: character?.numChats ? character?.numChats + 1 : 1,
      updatedAt,
    });
  },
});

export const choose = mutation({
  args: {
    chosen: v.string(),
    followUpId: v.id("followUps"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.followUpId, {
      chosen: args.chosen,
    });
  },
});
