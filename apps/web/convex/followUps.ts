import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
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
    await getUser(ctx);
    return await ctx.db
      .query("followUps")
      .withIndex("byChatId", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();
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
