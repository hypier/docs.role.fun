import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("score characters", { hours: 6 }, internal.characters.scoreAll);
crons.daily(
  "remove messages",
  {
    minuteUTC: 0,
    hourUTC: 0,
  },
  internal.messages.removeOldMessages,
);
crons.daily(
  "remove stories",
  {
    minuteUTC: 0,
    hourUTC: 0,
  },
  internal.messages.removeOldStories,
);
crons.daily(
  "remove chats",
  {
    minuteUTC: 0,
    hourUTC: 0,
  },
  internal.messages.removeOldChats,
);
crons.daily(
  "remove characters",
  {
    minuteUTC: 0,
    hourUTC: 0,
  },
  internal.characters.removeOldCharacters,
);
export default crons;
