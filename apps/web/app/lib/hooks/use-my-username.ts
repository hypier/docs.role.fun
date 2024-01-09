import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const useMyUsername = () => {
  try {
    const me = useQuery(api.users.me);
    return me.name;
  } catch (error) {
    return "You";
  }
};

export default useMyUsername;
