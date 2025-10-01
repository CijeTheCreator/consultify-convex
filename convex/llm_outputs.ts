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
  ]).describe("The most appropriate medical specialty to handle the patient's condition based on their symptoms and medical history")
});

export const DoctorSelectionRationale = z.object({
  rationale: z.string().describe("A concise explanation of why the selected doctor is the optimal choice for the patient's needs, focusing on medical alignment and qualifications")
});

export const GeneratedMessage = z.object({
  message_content: z.string().describe("The generated response message for the patient, providing medical guidance or requesting additional information in a professional and empathetic tone")
});

export const TranslatedMessage = z.object({
  translated_content: z.string().describe("The translated message content in the target language, maintaining the original tone, style, and medical terminology")
});

export const QueryGeneration = z.object({
  query: z.string().optional().describe("A precise search query optimized for retrieving relevant medical information from textbooks or clinical databases")
});

export const DoctorSelection = z.object({
  binary_score: z.enum(["YES", "NO"]).describe("Binary decision indicating whether sufficient information has been gathered to select an appropriate doctor for the patient")
});

export const RewrittenQuestion = z.object({
  improved_question: z.string().describe("An improved and reformulated version of the original query that maximizes search relevance and retrieval accuracy")
});

export type MedicalSpecialtyResponse = z.infer<typeof MedicalSpecialtyResponse>;
export type DoctorSelectionRationale = z.infer<typeof DoctorSelectionRationale>;
export type GeneratedMessage = z.infer<typeof GeneratedMessage>;
export type TranslatedMessage = z.infer<typeof TranslatedMessage>;
export type QueryGeneration = z.infer<typeof QueryGeneration>;
export type GradeDocuments = z.infer<typeof DoctorSelection>;
export type RewrittenQuestion = z.infer<typeof RewrittenQuestion>;
