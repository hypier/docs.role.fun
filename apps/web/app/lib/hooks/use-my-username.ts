import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const useMyUsername = (fallbackUsername = "You") => {
  try {
    const me = useQuery(api.users.me);
    return me.name;
  } catch (error) {
    return fallbackUsername;
  }
};

export default useMyUsername;
