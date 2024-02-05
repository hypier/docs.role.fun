import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const useSubscription = () => {
  try {
    const subscription = useQuery(api.payments.subscription);
    return subscription;
  } catch (error) {
    return { cancelsAt: "" };
  }
};

export default useSubscription;
