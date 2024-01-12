import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    chatId: v.id("chats"),
    characterId: v.optional(v.id("characters")),
    personaId: v.optional(v.id("personas")),
    text: v.string(),
    reaction: v.optional(
      v.union(
        v.literal("like"),
        v.literal("dislike"),
        v.literal("lol"),
        v.literal("cry"),
        v.literal("smirk"),
      ),
    ),
  })
    .index("byCharacterId", ["characterId"])
    .index("byChatId", ["chatId"]),
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    primaryPersonaId: v.optional(v.id("personas")),
    crystals: v.optional(v.number()),
    tokenIdentifier: v.string(),
    languageTag: v.optional(v.string()),
    nsfwPreference: v.optional(
      v.union(v.literal("block"), v.literal("auto"), v.literal("allow")),
    ),
  })
    .index("byToken", ["tokenIdentifier"])
    .index("byEmail", ["email"]),
  characters: defineTable({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    cardImageUrl: v.optional(v.string()),
    greetings: v.optional(v.array(v.string())),
    knowledge: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
    creatorId: v.id("users"),
    remixId: v.optional(v.id("characters")),
    isDraft: v.boolean(),
    isBlacklisted: v.boolean(),
    isNSFW: v.optional(v.boolean()), // NSFW characters are filtered unless the adult user has explicitly opted in.
    isArchived: v.optional(v.boolean()),
    isModel: v.optional(v.boolean()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    numChats: v.optional(v.number()),
    embedding: v.optional(v.array(v.float64())),
    model: v.optional(v.string()),
    languageTag: v.optional(v.string()), // ISO 639 Set 1 two-letter language code
    genreTag: v.optional(v.string()), // Genre define the character's genre, it can be "Anime", "Game", "VTuber", "History", "Religion", "Language", "Animal", "Philosophy", "Assistant", anything.
    personalityTag: v.optional(v.string()), // These tags describe the character's personality traits. Examples include "Introverted," "Brave," "Cunning," "Compassionate," "Sarcastic," etc.
    roleTag: v.optional(v.string()), // Role define the character's role or function in the story. Common examples are "Teacher", "Protagonist", "Antagonist", "Sidekick", "Mentor", "Comic relief", etc.
    updatedAt: v.string(),
  })
    .index("byUserId", ["creatorId"])
    .index("byNumChats", ["numChats"])
    .index("byUpdatedAt", ["updatedAt"])
    .index("byLanguage", ["languageTag"])
    .index("byGenre", ["genreTag"])
    .index("byPersonality", ["personalityTag"])
    .index("byRole", ["roleTag"])
    .vectorIndex("byEmbedding", {
      vectorField: "embedding",
      dimensions: 512,
      filterFields: ["name", "description", "instructions"],
    })
    .searchIndex("searchName", {
      searchField: "name",
    }),
  personas: defineTable({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    cardImageUrl: v.optional(v.string()),
    isPrivate: v.boolean(),
    isBlacklisted: v.boolean(),
    creatorId: v.id("users"),
    updatedAt: v.string(),
  }).index("byUserId", ["creatorId"]),
  chats: defineTable({
    chatName: v.optional(v.string()),
    updatedAt: v.string(),
    userId: v.optional(v.id("users")),
    storyId: v.optional(v.id("stories")),
    isUnlocked: v.optional(v.boolean()),
    characterId: v.optional(v.id("characters")),
    joinedAt: v.string(),
  })
    .index("byUserId", ["userId"])
    .index("byCharacterId", ["characterId"])
    .index("byUpdatedAt", ["updatedAt"]),
  followUps: defineTable({
    chatId: v.optional(v.id("chats")),
    followUp1: v.optional(v.string()),
    followUp2: v.optional(v.string()),
    followUp3: v.optional(v.string()),
    chosen: v.optional(v.string()),
    isStale: v.optional(v.boolean()),
  }).index("byChatId", ["chatId"]),
  usage: defineTable({
    userId: v.id("users"),
    name: v.string(),
  }).index("byUserId", ["userId"]),
  payments: defineTable({
    numCrystals: v.number(),
    stripeId: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("byStripeId", ["stripeId"])
    .index("byUserId", ["userId"]),
  checkIn: defineTable({
    userId: v.id("users"),
    date: v.string(),
  })
    .index("byUserId", ["userId"])
    .index("byDate", ["date"]),
  stories: defineTable({
    userId: v.id("users"),
    characterId: v.id("characters"),
    messageIds: v.array(v.id("messages")),
    name: v.optional(v.string()),
    numChats: v.optional(v.number()),
    isPrivate: v.boolean(),
    isNSFW: v.optional(v.boolean()),
  })
    .index("byUserId", ["userId"])
    .index("byNumChats", ["numChats"])
    .index("byCharacterId", ["characterId"]),
  regeneratedMessages: defineTable({
    messageId: v.id("messages"),
    query: v.optional(v.string()),
    rejectedMessage: v.optional(v.string()),
    regeneratedMessage: v.optional(v.string()),
  }),
  messageReaction: defineTable({
    messageId: v.id("messages"),
    text: v.optional(v.string()),
    type: v.union(
      v.literal("like"),
      v.literal("dislike"),
      v.literal("lol"),
      v.literal("cry"),
      v.literal("smirk"),
    ),
  }).index("byMessageId", ["messageId"]),
});
