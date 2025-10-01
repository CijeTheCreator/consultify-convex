import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const UserType = v.union(
  v.literal("PATIENT"),
  v.literal("DOCTOR"),
  v.literal("CLERK")
);

export const ConsultationState = v.union(
  v.literal("CLERKING"),
  v.literal("CONSULTING")
);

export const NotificationType = v.union(
  v.literal("SYSTEM"),
  v.literal("CONSULTATION"),
  v.literal("PRESCRIPTION")
);

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    type: UserType,
    specialty: v.optional(v.string()),
    language: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_type", ["type"]),

  messages: defineTable({
    translatedContent: v.optional(v.string()),
    translatedLanguage: v.optional(v.string()),
    originalLanguage: v.optional(v.string()),
    originalContent: v.optional(v.string()),
    llm_language: v.string(),
    llm_content: v.string(),
    state: v.optional(v.string()),
    senderId: v.id("users"),
    consultationId: v.id("consultations"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_consultation", ["consultationId"])
    .index("by_sender", ["senderId"]),

  consultations: defineTable({
    state: ConsultationState,
    prescriptionAssistance: v.optional(v.string()),
    prescriptionAssistanceState: v.optional(v.string()),
    patientId: v.id("users"),
    doctorId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"])
    .index("by_state", ["state"]),

  prescriptions: defineTable({
    drugName: v.string(),
    frequency: v.string(),
    startTimestamp: v.number(),
    endTimestamp: v.number(),
    patientId: v.id("users"),
    consultationId: v.id("consultations"),
    reminderSent: v.optional(v.boolean()),
    doseRemindersSent: v.optional(v.array(v.number())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_consultation", ["consultationId"]),

  notifications: defineTable({
    type: NotificationType,
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    userId: v.id("users"),
    consultationId: v.optional(v.id("consultations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_consultation", ["consultationId"]),
});