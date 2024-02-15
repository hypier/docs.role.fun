import { api } from "../../../convex/_generated/api";
import { useStableQuery } from "./use-stable-query";

const usePersona = () => {
  try {
    const persona = useStableQuery(api.users.persona);
    return persona;
  } catch (error) {
    return { name: "You", cardImageUrl: "" };
  }
};

export default usePersona;
