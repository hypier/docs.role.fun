import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { getUser } from "./users";
import { internal } from "./_generated/api";

/**
 * 定义了一个请求处理函数，用于处理特定的突变（mutation）请求。
 * 
 * @param name - 需要生成图像的角色名称。
 * @param description - 对角色的描述，用于生成图像的上下文。
 * @param characterId - 目标角色的ID，用于查询角色信息和生成图像。
 * @returns 返回生成的图像卡片的URL。
 */
export const request = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    characterId: v.id("characters"),
  },
  handler: async (ctx, { name, description, characterId }) => {
    // 获取当前操作的用户信息。
    const user = await getUser(ctx);
    // 安排一个任务，使用Dalle3生成图像，该任务将在当前操作完成后立即执行。
    await ctx.scheduler.runAfter(0, internal.image.generateWithDalle3, {
      userId: user._id,
      characterId,
      name,
      description,
    });
    // 从数据库中获取目标角色的信息。
    const character = await ctx.db.get(characterId);
    // 返回角色的图像卡片URL，如果角色不存在，则返回undefined。
    return character?.cardImageUrl;
  },
});

/**
 * 上传角色图像
 * 
 * 此函数用于上传角色的卡片图像。首先根据提供的角色ID验证角色是否存在，
 * 然后使用卡片图像存储ID从存储服务中获取图像URL，并最终更新角色信息以包含新的卡片图像URL。
 * 
 * @param characterId 角色的唯一标识符，用于查询和更新角色信息。
 * @param cardImageStorageId 存储中卡片图像的唯一标识符，用于获取图像URL。
 * @returns 更新了卡片图像URL后的角色信息。
 * @throws 如果角色不存在，则抛出ConvexError异常。
 */
export const uploadImage = internalMutation({
  args: {
    characterId: v.id("characters"),
    cardImageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // 根据角色ID从数据库中查询角色信息。
    const character = await ctx.db.get(args.characterId);
    // 如果角色不存在，抛出错误。
    if (!character) {
      throw new ConvexError({ message: "角色不存在。" });
    }
    // 从存储服务中获取卡片图像的URL。
    const cardImageUrl = (await ctx.storage.getUrl(
      args.cardImageStorageId
    )) as string;
    // 在数据库中更新角色的卡片图像URL并返回更新后的角色信息。
    const updatedCharacter = await ctx.db.patch(args.characterId, {
      cardImageUrl,
    });
    return updatedCharacter;
  },
});