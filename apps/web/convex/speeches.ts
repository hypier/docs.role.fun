import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUser } from "./users";
import { getCrystalPrice } from "./constants";

export const generate = mutation({
  args: {
    characterId: v.id("characters"),
    messageId: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, { characterId, messageId, text }) => {
    text = text.replace(/\(.*?\)|\*.*?\*/g, "").substring(0, 256);
    const character = await ctx.db.get(characterId);
    const voiceId = character?.voiceId
      ? character.voiceId
      : "MjxppkSa4IoDSRGySayZ";
    const existingSpeech = await ctx.db
      .query("speeches")
      .withIndex("byVoiceId")
      .filter((q) => q.eq(q.field("voiceId"), voiceId))
      .filter((q) => q.eq(q.field("text"), text))
      .first();
    const user = await getUser(ctx);
    const crystalPrice = getCrystalPrice(voiceId);
    if (user?.crystals < crystalPrice) {
      throw new ConvexError("Not enough crystals.");
    }
    if (existingSpeech && existingSpeech?.speechUrl) {
      await ctx.db.patch(messageId, { speechUrl: existingSpeech?.speechUrl });
      return;
    }
    const speechId = await ctx.db.insert("speeches", {
      text,
      voiceId,
    });
    await ctx.scheduler.runAfter(0, internal.speech.convertTextToSpeech, {
      speechId,
      messageId,
      text,
      voiceId,
      userId: user._id,
    });
  },
});

export const uploadSpeech = internalMutation({
  args: {
    speechId: v.id("speeches"),
    messageId: v.id("messages"),
    speechStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.speechId);
    if (!character) {
      throw new ConvexError({ message: "Character does not exist." });
    }
    const speechUrl = (await ctx.storage.getUrl(
      args.speechStorageId,
    )) as string;
    const updatedSpeech = await ctx.db.patch(args.speechId, {
      speechUrl,
    });
    const updatedMessage = await ctx.db.patch(args.messageId, {
      speechUrl,
    });
    return updatedSpeech;
  },
});
