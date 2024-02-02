import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.hourly(
  "score characters",
  { minuteUTC: 0 },
  internal.characters.scoreAll,
);
crons.weekly(
  "remove messages",
  {
    minuteUTC: 0,
    hourUTC: 0,
    dayOfWeek: "monday",
  },
  internal.messages.removeOldMessages,
);
crons.weekly(
  "remove stories",
  {
    minuteUTC: 0,
    hourUTC: 0,
    dayOfWeek: "monday",
  },
  internal.messages.removeOldStories,
);
crons.weekly(
  "remove chats",
  {
    minuteUTC: 0,
    hourUTC: 0,
    dayOfWeek: "monday",
  },
  internal.messages.removeOldChats,
);
export default crons;
