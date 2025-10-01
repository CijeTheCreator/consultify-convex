import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      type: user.type,
      specialty: user.specialty,
      language: user.language,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      type: user.type,
      specialty: user.specialty,
      language: user.language,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    type: v.string(),
    specialty: v.optional(v.string()),
    language: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      type: args.type as "PATIENT" | "DOCTOR" | "CLERK",
      specialty: args.specialty,
      language: args.language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const getPatientStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all consultations for this patient
    const consultations = await ctx.db
      .query("consultations")
      .withIndex("by_patient", (q) => q.eq("patientId", args.userId))
      .collect();

    // Get recent consultations (last 3)
    const recentConsultations = consultations
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);

    // Get recent consultations with details
    const recentConsultationsWithDetails = await Promise.all(
      recentConsultations.map(async (consultation) => {
        const doctor = consultation.doctorId ? await ctx.db.get(consultation.doctorId) : null;
        return {
          id: consultation._id,
          doctorId: consultation.doctorId,
          status: consultation.state,
          createdAt: new Date(consultation.createdAt).toISOString(),
          consultationType: doctor ? "DOCTOR" : "AI_TRIAGE"
        };
      })
    );

    // Count total messages for this patient across all consultations
    let totalMessages = 0;
    for (const consultation of consultations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_consultation", (q) => q.eq("consultationId", consultation._id))
        .collect();
      totalMessages += messages.length;
    }

    return {
      consultations: consultations.length,
      messages: totalMessages,
      recentConsultations: recentConsultationsWithDetails
    };
  },
});

export const getDoctorStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all consultations for this doctor
    const consultations = await ctx.db
      .query("consultations")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.userId))
      .collect();

    // Get recent consultations (last 3)
    const recentConsultations = consultations
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);

    // Get recent consultations with details
    const recentConsultationsWithDetails = await Promise.all(
      recentConsultations.map(async (consultation) => {
        return {
          id: consultation._id,
          patientId: consultation.patientId,
          status: consultation.state,
          createdAt: new Date(consultation.createdAt).toISOString(),
          consultationType: "DOCTOR"
        };
      })
    );

    // Count total messages for this doctor across all consultations
    let totalMessages = 0;
    for (const consultation of consultations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_consultation", (q) => q.eq("consultationId", consultation._id))
        .collect();
      totalMessages += messages.length;
    }

    return {
      consultations: consultations.length,
      messages: totalMessages,
      recentConsultations: recentConsultationsWithDetails
    };
  },
});

export const getDoctorsBySpecialty = query({
  args: { specialty: v.string() },
  handler: async (ctx, args) => {
    const doctors = await ctx.db
      .query("users")
      .withIndex("by_type", (q) => q.eq("type", "DOCTOR"))
      .collect();

    // Filter by specialty if provided, otherwise return all doctors
    const filteredDoctors = doctors.filter(doctor =>
      doctor.specialty === args.specialty || args.specialty === "General Medicine"
    );

    return filteredDoctors.map(doctor => ({
      id: doctor._id,
      email: doctor.email,
      name: doctor.name,
      specialty: doctor.specialty,
      language: doctor.language,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));
  },
});


export const getAllDoctors = query({
  args: {},
  handler: async (ctx, args) => {
    const doctors = await ctx.db
      .query("users")
      .withIndex("by_type", (q) => q.eq("type", "DOCTOR"))
      .collect();

    return doctors.map(doctor => ({
      id: doctor._id,
      email: doctor.email,
      name: doctor.name,
      specialty: doctor.specialty,
      language: doctor.language,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));
  },
});
