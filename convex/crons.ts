import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "daily prescription reminders",
  { hours: 24 }, // Run every 24 hours
  api.prescriptionReminderAction.sendPrescriptionReminders
);

export default crons;