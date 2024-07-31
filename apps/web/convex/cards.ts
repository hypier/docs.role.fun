import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// 查询所有cards 数据
export const allCards = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        // 查询所有的cards数据
        let query = ctx.db
            .query("cards")
            .filter((q) => q.neq(q.field("isHide"), true))

        return await query.paginate(args.paginationOpts);
    },
});

export const upsert = mutation({
    args: {
        characterId: v.id("characters"),
        imageUrl: v.string(),
        introduces: v.optional(v.string()),
    },
    handler: async (ctx, { characterId, imageUrl, introduces }) => {

        const card = await ctx.db
            .query("cards")
            .withIndex("byCharacterId", (q) => q.eq("characterId", characterId))
            .filter((q) => q.eq(q.field("characterId"), characterId))
            .first();

        if (card) {
            const isHide = false
            await ctx.db.patch(card._id, { imageUrl, introduces, isHide });
        } else {
            await ctx.db.insert("cards", {
                characterId,
                imageUrl,
                introduces,
                isHide: false,
            });
        }
    },
});


export const get = query({
    args: {
        characterId: v.id("characters"),
    },
    handler: async (ctx, { characterId }) => {
        const card = await ctx.db
            .query("cards")
            .withIndex("byCharacterId", (q) => q.eq("characterId", characterId))
            .filter((q) => q.eq(q.field("characterId"), characterId))
            .first();
        // 返回查询结果
        return card;
    },
});
