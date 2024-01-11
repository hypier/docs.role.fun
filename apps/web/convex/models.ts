import { query } from "./_generated/server";
import { modelData } from "./constants";

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    return modelData;
  },
});
