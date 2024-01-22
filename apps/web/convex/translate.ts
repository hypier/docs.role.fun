"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

import * as deepl from "deepl-node";
import { internal } from "./_generated/api";

export const translate = internalAction({
  args: {
    targetLanguage: v.optional(v.string()),
    userId: v.id("users"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message: any = await ctx.runQuery(internal.messages.get, {
      id: args.messageId,
    });
    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId: args.userId,
        name: "deepl",
      },
    );
    let result;
    try {
      const targetLanguage =
        (args.targetLanguage as deepl.TargetLanguageCode) ||
        ("en" as deepl.TargetLanguageCode);
      const translator = new deepl.Translator(
        process.env.DEEPL_API_KEY as string,
      );
      result = await translator.translateText(
        message.text as string,
        null,
        targetLanguage,
      );
      await ctx.runMutation(internal.messages.addTranslation, {
        messageId: args.messageId,
        translation: result.text,
      });
    } catch (error) {
      await ctx.runMutation(internal.serve.refundCrystal, {
        userId: args.userId,
        name: "deepl",
        currentCrystals,
      });
      throw error;
    }
    return result.text;
  },
});
