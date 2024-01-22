import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.hourly(
  "score characters",
  { minuteUTC: 0 },
  internal.characters.scoreAll,
);
export default crons;
