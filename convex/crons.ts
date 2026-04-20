import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("materialize recurring transactions", { hours: 24 }, internal.recurring.materializeDue, {
  batchSize: 100,
});

export default crons;
