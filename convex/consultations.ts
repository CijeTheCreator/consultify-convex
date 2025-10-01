import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      return null;
    }

    // Get patient and doctor details
    const patient = await ctx.db.get(consultation.patientId);
    const doctor = consultation.doctorId ? await ctx.db.get(consultation.doctorId) : null;

    return {
      id: consultation._id,
      state: consultation.state,
      prescriptionAssistance: consultation.prescriptionAssistance,
      prescriptionAssistanceState: consultation.prescriptionAssistanceState,
      patient_id: consultation.patientId,
      doctor_id: consultation.doctorId,
      patient,
      doctor,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  },
});

export const getConsultationsByUser = query({
  args: { 
    userId: v.id("users"),
    userType: v.string() 
  },
  handler: async (ctx, args) => {
    const consultations = args.userType === "PATIENT" 
      ? await ctx.db
          .query("consultations")
          .withIndex("by_patient", (q) => q.eq("patientId", args.userId))
          .collect()
      : await ctx.db
          .query("consultations")
          .withIndex("by_doctor", (q) => q.eq("doctorId", args.userId))
          .collect();

    // Get additional details for each consultation
    const consultationsWithDetails = await Promise.all(
      consultations.map(async (consultation) => {
        const patient = await ctx.db.get(consultation.patientId);
        const doctor = consultation.doctorId ? await ctx.db.get(consultation.doctorId) : null;
        
        return {
          id: consultation._id,
          state: consultation.state,
          prescriptionAssistance: consultation.prescriptionAssistance,
          prescriptionAssistanceState: consultation.prescriptionAssistanceState,
          patient_id: consultation.patientId,
          doctor_id: consultation.doctorId,
          patient,
          doctor,
          createdAt: consultation.createdAt,
          updatedAt: consultation.updatedAt,
        };
      })
    );

    return consultationsWithDetails;
  },
});

export const createConsultation = mutation({
  args: {
    patientId: v.id("users"),
    state: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const consultationId = await ctx.db.insert("consultations", {
      patientId: args.patientId,
      state: (args.state as "CLERKING" | "CONSULTING") || "CLERKING",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return consultationId;
  },
});

export const updateConsultationState = mutation({
  args: {
    consultationId: v.id("consultations"),
    state: v.string(),
    doctorId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.consultationId, {
      state: args.state as "CLERKING" | "CONSULTING",
      doctorId: args.doctorId,
      updatedAt: Date.now(),
    });

    return args.consultationId;
  },
});