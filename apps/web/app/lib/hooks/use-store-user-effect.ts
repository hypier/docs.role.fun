import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * 使用此效果将用户信息存储至存储器中。
 * 此函数负责将认证获取的用户信息同步到服务器的用户存储中，
 * 并管理用户ID在本地的状态。
 * 
 * @returns 存储的用户ID，若用户未认证或存储过程未发生则为null。
 */
export default function useStoreUserEffect() {
  // 使用ConvexAuth钩子获取用户认证状态
  const { isAuthenticated } = useConvexAuth();
  // 使用User钩子获取当前用户信息
  const { user } = useUser();

  // 初始化用户ID状态，用于追踪存储后的用户ID
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  // 定义一个突变用来存储用户信息至'users'表
  const storeUser = useMutation(api.users.store);

  // 当认证状态、存储用户突变或用户ID变化时，执行副作用
  useEffect(() => {
    // 若用户未登录，不执行后续操作
    if (!isAuthenticated) {
      return;
    }

    // 异步函数以存储用户至数据库
    async function createUser() {
      // 打印用户信息日志（可视为调试信息）
      // console.log("服务器端身份标识", user);
      // 调用storeUser突变存储用户，并获取返回的ID
      const id = await storeUser({ username: user?.fullName as string });
      // 设置存储后用户的ID至本地状态
      setUserId(id);
    }

    // 执行创建用户操作
    createUser();

    // 清理函数，当effect依赖变化时将userId重置为null
    return () => setUserId(null);
    // 确保用户使用不同身份登录时，此effect能重新执行
  }, [isAuthenticated, storeUser, user?.id]);

  // 返回已存储的用户ID
  return userId;
}
