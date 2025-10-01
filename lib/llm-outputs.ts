import { z } from "zod";

export const MedicalSpecialtyResponse = z.object({
  specialty: z.enum([
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Radiology",
    "Surgery",
    "Urology",
  ])
});

export const DoctorSelectionRationale = z.object({
  rationale: z.string()
});

export const GeneratedMessage = z.object({
  message_content: z.string().describe("The message generated, the next reply the user")
});

export const TranslatedMessage = z.object({
  translated_content: z.string()
});

export const QueryGeneration = z.object({
  query: z.string().optional()
});

export const GradeDocuments = z.object({
  binary_score: z.enum(["YES", "NO"])
});

export const RewrittenQuestion = z.object({
  improved_question: z.string()
});

export type MedicalSpecialtyResponse = z.infer<typeof MedicalSpecialtyResponse>;
export type DoctorSelectionRationale = z.infer<typeof DoctorSelectionRationale>;
export type GeneratedMessage = z.infer<typeof GeneratedMessage>;
export type TranslatedMessage = z.infer<typeof TranslatedMessage>;
export type QueryGeneration = z.infer<typeof QueryGeneration>;
export type GradeDocuments = z.infer<typeof GradeDocuments>;
export type RewrittenQuestion = z.infer<typeof RewrittenQuestion>;
