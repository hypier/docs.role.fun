import { api } from "../../../convex/_generated/api";
import { useStableQuery } from "./use-stable-query";

const useCachedCurrentUser = () => {
  try {
    const me = useStableQuery(api.users.me);
    return me;
  } catch (error) {
    return {};
  }
};

export default useCachedCurrentUser;
