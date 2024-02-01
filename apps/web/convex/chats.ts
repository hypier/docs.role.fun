import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    chatName: v.optional(v.string()),
    characterId: v.id("characters"),
    storyId: v.optional(v.id("stories")),
    isNew: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!args.isNew) {
      let chat = await ctx.db
        .query("chats")
        .withIndex("by_creation_time")
        .filter((q) => q.eq(q.field("characterId"), args.characterId))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .filter((q) => q.eq(q.field("storyId"), args.storyId))
        .order("desc")
        .first();

      if (chat) {
        return chat._id;
      }
    }
    const { isNew, ...rest } = args;
    const newChat = await ctx.db.insert("chats", {
      ...rest,
      userId: user._id,
      updatedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    });
    const character = await ctx.db.get(args.characterId);
    const greeting = character?.greetings
      ? (character.greetings[0] as string)
      : ("" as string);
    const persona = user?.primaryPersonaId
      ? await ctx.db.get(user.primaryPersonaId)
      : undefined;
    const userRole =
      typeof persona === "object" && persona !== null && "name" in persona
        ? persona.name
        : user.name;
    const formattedText = greeting.replaceAll("{{user}}", userRole);
    const speech = await ctx.db
      .query("speeches")
      .filter((q) => q.eq(q.field("voiceId"), character?.voiceId))
      .filter((q) =>
        q.eq(q.field("text"), formattedText?.replace(/\(.*?\)|\*.*?\*/g, "")),
      )
      .first();
    const messageId = await ctx.db.insert("messages", {
      text: formattedText,
      chatId: newChat,
      characterId: character?._id,
      speechUrl: speech ? speech.speechUrl : undefined,
    });

    const userLanguage =
      user.languageTag === "en"
        ? "en-US"
        : user.languageTag === "pt"
          ? "pt-PT"
          : user.languageTag;

    if (
      user?.languageTag &&
      user?.languageTag !== "en" &&
      user.autoTranslate !== false
    ) {
      await ctx.scheduler.runAfter(0, internal.translate.translate, {
        targetLanguage: userLanguage,
        userId: user._id,
        messageId,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.llm.generateFollowups, {
        personaId: persona?._id as Id<"personas">,
        chatId: newChat as Id<"chats">,
        characterId: character?._id as Id<"characters">,
        userId: user._id as Id<"users">,
      });
    }
    return newChat;
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const results = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .paginate(args.paginationOpts);
    return results;
  },
});

export const get = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    return await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .first();
  },
});

export const remove = mutation({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
    if (chat) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("byChatId", (q) => q.eq("chatId", args.id))
        .collect();
      await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
      return await ctx.db.delete(args.id);
    }
  },
});
