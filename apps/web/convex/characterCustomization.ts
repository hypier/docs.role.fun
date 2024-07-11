import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

/**
 * 定义了一个名为upsert的突变（mutation），用于插入或更新角色定制信息。
 *
 * @param characterId - 角色的唯一标识符。
 * @param model - 角色的定制模型。
 *
 * 此函数首先尝试根据用户ID和角色ID查询已存在的角色定制信息。
 * 如果找到现有定制，则更新其模型；否则，插入新的角色定制记录。
 */
export const upsert = mutation({
  args: {
    characterId: v.id("characters"),
    model: v.string(),
  },
  handler: async (ctx, { characterId, model }) => {
    // 获取当前操作的用户信息。
    const user = await getUser(ctx);
    // 尝试查询已存在的角色定制信息。
    const existingCustomization = await ctx.db
      .query("characterCustomizations")
      .withIndex("byUserId", (q) => q.eq("userId", user?._id as Id<"users">))
      .filter((q) => q.eq(q.field("characterId"), characterId))
      .first();
    // 如果存在已有的角色定制，则更新其模型。
    if (existingCustomization) {
      await ctx.db.patch(existingCustomization._id, { model });
    } else {
      // 如果不存在，则插入新的角色定制记录。
      await ctx.db.insert("characterCustomizations", {
        characterId,
        model,
        userId: user?._id,
      });
    }
  },
});


/**
 * 使用查询语法定义了一个获取特定角色定制信息的异步函数。
 *
 * @param {Object} ctx - 上下文对象，包含请求和响应等信息。
 * @param {number} characterId - 角色ID，用于查询特定角色的定制信息。
 * @returns {Object} 返回查询到的角色定制信息。
 * @throws {Error} 如果用户不存在，则抛出“User not found”的错误。
 */
export const get = query({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, { characterId }) => {
    // 根据上下文获取用户信息
    const user = await getUser(ctx);
    // 如果用户不存在，则抛出错误
    if (!user) {
      throw new Error("User not found");
    }
    // 通过数据库查询与用户关联的角色定制信息
    const customization = await ctx.db
      .query("characterCustomizations")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("characterId"), characterId))
      .first();
    // 返回查询结果
    return customization;
  },
});
