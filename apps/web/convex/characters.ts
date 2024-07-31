import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";
import { embedText } from "./ingest/embed";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * 定义了一个用于插入或更新角色信息的突变（mutation）函数。
 * 
 * @param args - 包含角色各种属性的参数对象，其中id的存在与否决定是更新还是插入操作。
 * @returns 返回更新或插入后的角色数据。
 */
export const upsert = mutation({
  args: {
    id: v.optional(v.id("characters")),
    remixId: v.optional(v.id("characters")),
    voiceId: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    model: v.optional(v.string()),
    instructions: v.optional(v.string()),
    cardImageUrl: v.optional(v.string()),
    cardImageStorageId: v.optional(v.id("_storage")),
    greetings: v.optional(v.array(v.string())),
    knowledge: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
    isNSFW: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 获取当前操作用户的信息
    const user = await getUser(ctx);
    // 获取当前时间，用于更新角色的更新时间字段
    const updatedAt = new Date().toISOString();

    // 如果提供了角色id，则执行更新操作
    if (args.id) {
      // 从数据库中获取对应的角色草稿
      const characterDraft = await ctx.db.get(args.id);
      // 检查当前用户是否有权限修改这个角色
      if (characterDraft && user._id !== characterDraft.creatorId) {
        throw new ConvexError({
          message: "User does not have permission to modify this character.",
        });
      }
      // 构建要更新的角色信息，处理cardImageUrl的获取和设置
      const { id, cardImageUrl, cardImageStorageId, ...rest } = args;
      const character = await ctx.db.patch(id, {
        ...rest,
        ...(cardImageStorageId
          ? {
              cardImageUrl: (await ctx.storage.getUrl(
                cardImageStorageId,
              )) as string,
            }
          : { cardImageUrl }),
        updatedAt,
      });
      return character;
    } else {
      // 如果没有提供角色id，则执行插入操作
      // 从args中解构出用于插入角色的信息，并处理description和instructions的长度限制
      const {
        cardImageStorageId,
        cardImageUrl,
        description,
        instructions,
        ...rest
      } = args;
      // 插入新的角色信息到数据库，包括创建者id、更新时间等字段
      const character = await ctx.db.insert("characters", {
        ...rest,
        description: description?.substring(0, 128),
        instructions: instructions?.substring(0, 1024),
        ...(cardImageStorageId
          ? {
              cardImageUrl: (await ctx.storage.getUrl(
                cardImageStorageId,
              )) as string,
            }
          : { cardImageUrl }),
        creatorId: user._id,
        updatedAt,
        numChats: 0,
        isDraft: true,
        isArchived: false,
        isBlacklisted: false,
      });
      return character;
    }
  },
});


/**
 * 发布角色信息的突变函数。
 * 
 * 此函数允许用户将角色从草稿状态发布为公开或私有状态。在发布过程中，它会验证用户是否有权限发布该角色，
 * 确保角色具有必要的信息（如名称和卡牌图像），并更新角色的状态和相关信息。
 * 
 * @param ctx 上下文对象，包含数据库访问和用户信息等。
 * @param args 函数参数，包括角色ID和可见性设置。
 * @returns 返回发布角色的ID。
 * @throws 如果角色不存在、用户无权限修改、角色缺少必要信息或设置为公开但缺少卡牌图像，则抛出错误。
 */
export const publish = mutation({
  args: {
    id: v.id("characters"),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
  },
  handler: async (ctx, args) => {
    // 获取当前操作用户的信息。
    const user = await getUser(ctx);
    // 根据角色ID从数据库中获取角色信息。
    const character = await ctx.db.get(args.id);

    // 验证角色是否存在。
    if (!character)
      throw new ConvexError({ message: "Character does not exist." });
    // 验证用户是否有权限修改该角色。
    if (user._id !== character.creatorId)
      throw new ConvexError({
        message: "User does not have permission to modify this character.",
      });
    // 如果角色设置为公开，验证是否具有卡牌图像。
    if (!character.cardImageUrl && args.visibility === "public")
      throw new ConvexError({
        message: "Character must have a card image to be published.",
      });
    // 验证角色是否具有名称。
    if (!character.name)
      throw new ConvexError({ message: "Character must have a name." });

    // 默认问候语设置。
    const greeting = character.greetings?.[0] || "Hi.";
    // 更新角色的更新时间。
    const updatedAt = new Date().toISOString();
    // 根据角色描述是否为空，决定是否更新描述信息。
    const description = character.description ? {} : { description: greeting };
    // 根据角色是否已有问候语，决定是否更新问候语信息。
    const greetings = character?.greetings?.[0]
      ? { greetings: character.greetings }
      : { greetings: ["Hi."] };

    // 更新角色状态和相关信息。
    await ctx.db.patch(args.id, {
      isDraft: false,
      visibility: args.visibility,
      ...description,
      ...greetings,
      updatedAt,
    });

    // 如果角色没有语言标签，安排生成标签的任务。
    if (!character.languageTag) {
      await ctx.scheduler.runAfter(0, internal.llm.generateTags, {
        userId: user._id,
        characterId: character._id,
      });
    }

    // 返回角色ID。
    return character._id;
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    genreTag: v.optional(v.string()),
    personalityTag: v.optional(v.string()),
    genderTag: v.optional(v.string()),
    languageTag: v.optional(v.string()),
    model: v.optional(v.string()),
    nsfwPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("characters")
      .withIndex("byScore")
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("isModel"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));
    if (args.genreTag) {
      query = query.filter((q) => q.eq(q.field("genreTag"), args.genreTag));
    }
    if (args.personalityTag) {
      query = query.filter((q) =>
        q.eq(q.field("personalityTag"), args.personalityTag),
      );
    }
    if (args.genderTag) {
      query = query.filter((q) => q.eq(q.field("genderTag"), args.genderTag));
    }
    if (args.languageTag) {
      query = query.filter((q) =>
        q.eq(q.field("languageTag"), args.languageTag),
      );
    }
    if (args.model) {
      query = query.filter((q) => q.eq(q.field("model"), args.model));
    }

    if (args.nsfwPreference !== "allow") {
      query = query.filter((q) => q.neq(q.field("isNSFW"), true));
    }

    return await query.order("desc").paginate(args.paginationOpts);
  },
});

export const listWithHides = query({
  args: {
    paginationOpts: paginationOptsValidator,
    genreTag: v.optional(v.string()),
    personalityTag: v.optional(v.string()),
    genderTag: v.optional(v.string()),
    languageTag: v.optional(v.string()),
    model: v.optional(v.string()),
    nsfwPreference: v.optional(v.string()),
    isAuthenticated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("characters")
      .withIndex("byScore", (q) => q.gt("score", 0))
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("isModel"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));
    if (args.genreTag) {
      query = query.filter((q) => q.eq(q.field("genreTag"), args.genreTag));
    }
    if (args.personalityTag) {
      query = query.filter((q) =>
        q.eq(q.field("personalityTag"), args.personalityTag),
      );
    }
    if (args.genderTag) {
      query = query.filter((q) => q.eq(q.field("genderTag"), args.genderTag));
    }
    if (args.languageTag) {
      query = query.filter((q) =>
        q.eq(q.field("languageTag"), args.languageTag),
      );
    }
    if (args.model) {
      query = query.filter((q) => q.eq(q.field("model"), args.model));
    }

    if (args.nsfwPreference !== "allow") {
      query = query.filter((q) => q.neq(q.field("isNSFW"), true));
    }

    const paginationResult = await query
      .order("desc")
      .paginate(args.paginationOpts);

    let user: any;
    try {
      user = await getUser(ctx, true);
    } catch (error) {
      return paginationResult;
    }

    // Fetch all the hides for the current user
    const hides = user
      ? await ctx.db
          .query("hides")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("type"), "characters"))
          .order("desc")
          .take(256)
      : [];
    const hiddenCharacterIds = hides.map((hide: any) => hide.elementId);

    // Filter out the characters that are in the hides list
    const pageWithFilteredCharacters = paginationResult.page.filter(
      (character) => !hiddenCharacterIds.includes(character._id),
    );

    return {
      ...paginationResult,
      page: pageWithFilteredCharacters,
    };
  },
});

export const listBackend = query({
  args: {
    genreTag: v.optional(v.string()),
    personalityTag: v.optional(v.string()),
    genderTag: v.optional(v.string()),
    languageTag: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("characters")
      .withIndex("byScore")
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("isModel"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));
    if (args.genreTag) {
      query = query.filter((q) => q.eq(q.field("genreTag"), args.genreTag));
    }
    if (args.personalityTag) {
      query = query.filter((q) =>
        q.eq(q.field("personalityTag"), args.personalityTag),
      );
    }
    if (args.genderTag) {
      query = query.filter((q) => q.eq(q.field("genderTag"), args.genderTag));
    }
    if (args.languageTag) {
      query = query.filter((q) =>
        q.eq(q.field("languageTag"), args.languageTag),
      );
    }
    if (args.model) {
      query = query.filter((q) => q.eq(q.field("model"), args.model));
    }

    return await query.order("desc").take(300);
  },
});

export const listModels = query({
  args: {
    paginationOpts: paginationOptsValidator,
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("characters")
      .withIndex("byScore")
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isModel"), true))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));
    if (args.model) {
      query = query.filter((q) => q.eq(q.field("model"), args.model));
    }

    return await query.order("desc").paginate(args.paginationOpts);
  },
});

export const listAllModels = query({
  args: {},
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("characters")
      .withIndex("byScore")
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isModel"), true))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));
    
    return await query.order("desc").take(500);
  },
});

export const search = query({
  args: {
    paginationOpts: paginationOptsValidator,
    genreTag: v.optional(v.string()),
    personalityTag: v.optional(v.string()),
    genderTag: v.optional(v.string()),
    languageTag: v.optional(v.string()),
    model: v.optional(v.string()),
    query: v.optional(v.string()),
    nsfwPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query;
    if (args.query) {
      query = ctx.db
        .query("characters")
        .withSearchIndex("searchName", (q) =>
          q.search("name", args.query as string),
        )
        .filter((q) => q.eq(q.field("isDraft"), false))
        .filter((q) => q.eq(q.field("isBlacklisted"), false))
        .filter((q) => q.neq(q.field("isArchived"), true))
        .filter((q) => q.neq(q.field("visibility"), "private"));
    } else {
      query = ctx.db
        .query("characters")
        .withIndex("byNumChats")
        .order("desc")
        .filter((q) => q.eq(q.field("isDraft"), false))
        .filter((q) => q.eq(q.field("isBlacklisted"), false))
        .filter((q) => q.neq(q.field("isArchived"), true))
        .filter((q) => q.neq(q.field("visibility"), "private"));
    }
    if (args.genreTag) {
      query = query.filter((q) => q.eq(q.field("genreTag"), args.genreTag));
    }
    if (args.personalityTag) {
      query = query.filter((q) =>
        q.eq(q.field("personalityTag"), args.personalityTag),
      );
    }
    if (args.genderTag) {
      query = query.filter((q) => q.eq(q.field("genderTag"), args.genderTag));
    }
    if (args.languageTag) {
      query = query.filter((q) =>
        q.eq(q.field("languageTag"), args.languageTag),
      );
    }
    if (args.model) {
      query = query.filter((q) => q.eq(q.field("model"), args.model));
    }
    if (args.nsfwPreference !== "allow") {
      query = query.filter((q) => q.neq(q.field("isNSFW"), true));
    }

    return await query.paginate(args.paginationOpts);
  },
});

export const listMy = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    return await ctx.db
      .query("characters")
      .withIndex("byUserId", (q) => q.eq("creatorId", user._id))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const get = query({
  args: {
    id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.id);
    if (character?.visibility !== "public") {
      const user = await getUser(ctx);
      if (character?.creatorId !== user._id) {
        throw new ConvexError({
          message: "You do not have permission to view this character.",
        });
      }
    }
    return character;
  },
});

export const getCharacter = internalQuery({
  args: {
    id: v.id("characters"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let character = await ctx.db.get(args.id);
    if (args.userId && character) {
      const customizations = await ctx.db
        .query("characterCustomizations")
        .withIndex("byUserId", (q) =>
          q.eq("userId", args.userId as Id<"users">),
        )
        .filter((q) => q.eq(q.field("characterId"), args.id))
        .unique();
      if (customizations) {
        character.model = customizations.model || character.model;
        character.voiceId = customizations.voiceId || character.voiceId;
        character.languageTag =
          customizations.languageTag || character.languageTag;
      }
    }
    return character;
  },
});

export const archive = mutation({
  args: {
    id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const characterDraft = await ctx.db.get(args.id);
    if (characterDraft && user._id !== characterDraft.creatorId) {
      throw new ConvexError({
        message: "User does not have permission to modify this character.",
      });
    }
    return await ctx.db.patch(args.id, { isArchived: true });
  },
});

export const similarCharacters = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const embedding = await embedText(args.query);
    return await ctx.vectorSearch("characters", "byEmbedding", {
      vector: embedding[0] as number[],
      limit: 16,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const generateInstruction = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    characterId: v.id("characters"),
  },
  handler: async (ctx, { name, description, characterId }) => {
    const user = await getUser(ctx);
    await ctx.scheduler.runAfter(0, internal.llm.generateInstruction, {
      userId: user._id,
      characterId,
      name,
      description,
    });
    const character = await ctx.db.get(characterId);
    return character?.instructions;
  },
});

export const autofill = internalMutation(
  async (
    ctx,
    {
      characterId,
      name,
      description,
      instructions,
      greeting,
    }: {
      characterId: Id<"characters">;
      name: string;
      description: string;
      instructions: string;
      greeting: string;
    },
  ) => {
    return await ctx.db.patch(characterId, {
      name,
      description,
      instructions,
      greetings: [greeting],
    });
  },
);

export const tag = internalMutation(
  async (
    ctx,
    {
      characterId,
      languageTag,
      genreTag,
      personalityTag,
      genderTag,
      isNSFW,
      isBlacklisted,
    }: {
      characterId: Id<"characters">;
      languageTag: string;
      genreTag: string;
      personalityTag: string;
      genderTag: string;
      isNSFW: boolean;
      isBlacklisted?: boolean;
    },
  ) => {
    return await ctx.db.patch(characterId, {
      languageTag,
      genreTag,
      personalityTag,
      genderTag,
      ...(isNSFW ? { isNSFW } : {}),
      ...(isBlacklisted ? { isBlacklisted } : {}),
    });
  },
);

export const generate = mutation({
  args: {},
  handler: async (ctx, {}) => {
    const user = await getUser(ctx);
    const updatedAt = new Date().toISOString();
    const character = await ctx.db.insert("characters", {
      creatorId: user._id,
      updatedAt,
      numChats: 0,
      isDraft: true,
      isArchived: false,
      isNSFW: false,
      isBlacklisted: false,
    });
    await ctx.scheduler.runAfter(0, internal.llm.generateCharacter, {
      userId: user._id,
      characterId: character,
    });
    return character;
  },
});

export const listPopularTags = query({
  handler: async (ctx) => {
    let user: any;
    try {
      user = await getUser(ctx, true);
    } catch (error) {
      console.error("Error getting user:", error);
    }
    let query = ctx.db
      .query("characters")
      .withIndex("byScore", (q) => q.gt("score", 0))
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("isModel"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));

    if (user && user.nsfwPreference !== "allow") {
      query = query.filter((q) => q.neq(q.field("isNSFW"), true));
    }
    const popularCharacters = await query.order("desc").take(150);
    type TagCount = { [key: string]: number };
    type TagCounts = { [key: string]: TagCount };
    const tagCounts: TagCounts = popularCharacters.reduce(
      (acc: TagCounts, character) => {
        (
          [
            "genderTag",
            "genreTag",
            "languageTag",
            "personalityTag",
            "model",
          ] as const
        ).forEach((tag) => {
          const tagValue = character[tag];
          if (tagValue) {
            acc[tag] = acc[tag] || {};
            // @ts-ignore
            acc[tag][tagValue] = (acc[tag][tagValue] || 0) + 1;
          }
        });
        return acc;
      },
      {},
    );
    type MostFrequentTags = {
      [key: string]: { tagName: string; count: number }[];
    };
    const mostFrequentTags: MostFrequentTags = Object.keys(tagCounts).reduce(
      (acc: MostFrequentTags, tag) => {
        // @ts-ignore
        const sortedTags = Object.entries(tagCounts[tag])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([tagName, count]) => ({ tagName, count }));
        acc[tag] = sortedTags;
        return acc;
      },
      {},
    );

    return mostFrequentTags;
  },
});

export const scoreAll = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("characters")
      .withIndex("byUpdatedAt")
      .filter((q) => q.eq(q.field("isDraft"), false))
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("isModel"), true))
      .filter((q) => q.neq(q.field("visibility"), "private"));
    const characters = await query.order("desc").take(1024);
    characters.forEach(async (character) => {
      const createdAt = character?._creationTime as number;
      const numChats = character?.numChats || 1;
      const numUsers = character?.numUsers || 1;
      await ctx.db.patch(character._id, {
        score:
          (numChats + numUsers * 5) /
          Math.pow(
            (new Date().getTime() - createdAt + 2 * 60 * 60 * 1000) /
              (7 * 24 * 60 * 60 * 1000),
            1.1,
          ),
        updatedAt: new Date().toISOString(),
      });
    });
  },
});

export const translate = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const character = await ctx.db.get(args.id);
    const userLanguage =
      user.languageTag === "en"
        ? "en-US"
        : user.languageTag === "pt"
          ? "pt-PT"
          : user.languageTag;
    const existingTranslation = await ctx.db
      .query("translations")
      .withIndex("byLanguage", (q) => q.eq("languageTag", userLanguage))
      .filter((q) => q.eq(q.field("text"), character?.name))
      .first();
    if (userLanguage && !existingTranslation && userLanguage !== "en-US") {
      await ctx.scheduler.runAfter(0, internal.translate.string, {
        text: character?.name as string,
        targetLanguage: userLanguage,
      });
      await ctx.scheduler.runAfter(0, internal.translate.string, {
        text: character?.description as string,
        targetLanguage: userLanguage,
      });
    }
  },
});

export const removeOldCharacters = internalMutation({
  args: {},
  handler: async (ctx) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldCharacters = await ctx.db
      .query("characters")
      .withIndex("by_creation_time", (q) =>
        q.lt("_creationTime", weekAgo.getTime()),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("isArchived"), true),
          q.eq(q.field("isBlacklisted"), true),
        ),
      )
      .take(4000);
    await Promise.all(
      oldCharacters.map((character) => ctx.db.delete(character._id)),
    );
    return { removed: oldCharacters.length };
  },
});
