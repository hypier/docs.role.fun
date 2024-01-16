import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { getUser } from "./users";
import { paginationOptsValidator } from "convex/server";
import { getCrystalPrice } from "./constants";

export const generate = mutation({
  args: {
    prompt: v.string(),
    model: v.union(
      v.literal("stable-diffusion-xl-1024-v1-0"),
      v.literal("dalle-3"),
    ),
  },
  handler: async (ctx, { prompt, model }) => {
    const user = await getUser(ctx);
    const crystalPrice = getCrystalPrice(model);
    if (user?.crystals < crystalPrice) {
      throw new ConvexError("Not enough crystals.");
    }
    const image = await ctx.db.insert("images", {
      prompt,
      model,
      imageUrl: "",
      creatorId: user._id,
      numLikes: 0,
      isNSFW: false,
      isBlacklisted: false,
      isArchived: false,
    });
    await ctx.scheduler.runAfter(0, internal.image.generateByPrompt, {
      userId: user._id,
      imageId: image,
      prompt,
      model,
    });
    return image;
  },
});

export const uploadImage = internalMutation({
  args: {
    imageId: v.id("images"),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.imageId);
    if (!character) {
      throw new ConvexError({ message: "Character does not exist." });
    }
    const imageUrl = (await ctx.storage.getUrl(args.imageStorageId)) as string;
    const updatedCharacter = await ctx.db.patch(args.imageId, {
      imageUrl,
    });
    return updatedCharacter;
  },
});

export const listImages = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("images")
      .withIndex("by_creation_time")
      .filter((q) => q.eq(q.field("isBlacklisted"), false))
      .filter((q) => q.eq(q.field("isNSFW"), false))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .filter((q) => q.neq(q.field("imageUrl"), ""));

    return await query.order("desc").paginate(args.paginationOpts);
  },
});

export const get = query({
  args: {
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new ConvexError({ message: "Image does not exist." });
    }
    return image;
  },
});
