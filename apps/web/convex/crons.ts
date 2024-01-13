import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.daily(
  "score characters",
  { hourUTC: 0, minuteUTC: 0 },
  internal.characters.scoreAll,
);
export default crons;
