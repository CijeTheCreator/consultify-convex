import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getPrescriptionsByPatient = query({
  args: { patientId: v.id("users") },
  handler: async (ctx, args) => {
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    return prescriptions.map((prescription) => ({
      id: prescription._id,
      drugName: prescription.drugName,
      frequency: prescription.frequency,
      startTimestamp: new Date(prescription.startTimestamp).toISOString(),
      endTimestamp: new Date(prescription.endTimestamp).toISOString(),
      patientId: prescription.patientId,
      consultationId: prescription.consultationId,
      createdAt: new Date(prescription.createdAt).toISOString(),
      updatedAt: new Date(prescription.updatedAt).toISOString(),
    }));
  },
});

export const getPrescriptionsByConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .collect();

    return prescriptions.map((prescription) => ({
      id: prescription._id,
      drugName: prescription.drugName,
      frequency: prescription.frequency,
      startTimestamp: new Date(prescription.startTimestamp).toISOString(),
      endTimestamp: new Date(prescription.endTimestamp).toISOString(),
      patientId: prescription.patientId,
      consultationId: prescription.consultationId,
      createdAt: new Date(prescription.createdAt).toISOString(),
      updatedAt: new Date(prescription.updatedAt).toISOString(),
    }));
  },
});

export const createPrescription = mutation({
  args: {
    drugName: v.string(),
    frequency: v.string(),
    startTimestamp: v.number(),
    endTimestamp: v.number(),
    patientId: v.id("users"),
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const prescriptionId = await ctx.db.insert("prescriptions", {
      drugName: args.drugName,
      frequency: args.frequency,
      startTimestamp: args.startTimestamp,
      endTimestamp: args.endTimestamp,
      patientId: args.patientId,
      consultationId: args.consultationId,
      reminderSent: false,
      doseRemindersSent: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return prescriptionId;
  },
});

export const getAllPrescriptionsForReminders = query({
  args: {},
  handler: async (ctx) => {
    const currentTime = Date.now();
    const prescriptions = await ctx.db
      .query("prescriptions")
      .filter((q) => 
        q.and(
          q.lte(q.field("startTimestamp"), currentTime),
          q.gte(q.field("endTimestamp"), currentTime),
          q.neq(q.field("reminderSent"), true)
        )
      )
      .collect();

    return prescriptions;
  },
});

export const markReminderSent = mutation({
  args: { prescriptionId: v.id("prescriptions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prescriptionId, {
      reminderSent: true,
      updatedAt: Date.now(),
    });
  },
});

export const markDoseReminderSent = mutation({
  args: { 
    prescriptionId: v.id("prescriptions"),
    doseTimestamp: v.number()
  },
  handler: async (ctx, args) => {
    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) return;

    const existingReminders = prescription.doseRemindersSent || [];
    if (!existingReminders.includes(args.doseTimestamp)) {
      await ctx.db.patch(args.prescriptionId, {
        doseRemindersSent: [...existingReminders, args.doseTimestamp],
        updatedAt: Date.now(),
      });
    }
  },
});