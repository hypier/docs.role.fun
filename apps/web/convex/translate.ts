"use node";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

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
    let result;
    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId: args.userId,
        name: "deepl",
      },
    );
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
        currentCrystals,
        name: "deepl",
      });
      await ctx.runMutation(internal.messages.addTranslation, {
        messageId: args.messageId,
        translation: `Not enough crystals. You need 3 crystals to use translation.`,
      });
      throw error;
    }
    return result.text;
  },
});

export const intercept = internalAction({
  args: {
    userLanguage: v.optional(v.string()),
    targetLanguage: v.optional(v.string()),
    userId: v.id("users"),
    chatId: v.id("chats"),
    characterId: v.id("characters"),
    personaId: v.optional(v.id("personas")),
    messageId: v.id("messages"),
    autoTranslate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const message: any = await ctx.runQuery(internal.messages.get, {
      id: args.messageId,
    });
    let result;

    try {
      if (
        args.userLanguage !== "en-US" &&
        args.autoTranslate !== false &&
        args.userLanguage
      ) {
        const { currentCrystals } = await ctx.runMutation(
          internal.serve.useCrystal,
          {
            userId: args.userId,
            name: "deepl",
          },
        );
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
          await ctx.runMutation(internal.messages.interceptTranslation, {
            messageId: args.messageId,
            translation: message.text as string,
            text: result.text,
          });
        } catch (error) {
          await ctx.runMutation(internal.serve.refundCrystal, {
            userId: args.userId,
            currentCrystals,
            name: "deepl",
          });
          console.log("translation error:", error);
        }
      }
    } catch (error) {
      console.log("skipping translation");
    }
    await ctx.scheduler.runAfter(0, internal.llm.answer, {
      chatId: args.chatId,
      characterId: args.characterId,
      personaId: args.personaId && args.personaId,
      userId: args.userId,
    });
  },
});

export const string = internalAction({
  args: {
    text: v.string(),
    targetLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let result;
    const languageTag =
      args.targetLanguage === "en"
        ? "en-US"
        : args.targetLanguage === "pt"
          ? "pt-PT"
          : (args.targetLanguage as deepl.TargetLanguageCode);

    const translator = new deepl.Translator(
      process.env.DEEPL_API_KEY as string,
    );
    result = await translator.translateText(
      args.text as string,
      null,
      languageTag,
    );
    await ctx.runMutation(internal.translation.save, {
      text: args.text,
      translation: result.text,
      languageTag,
    });

    return result.text;
  },
});
