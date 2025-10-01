export type { User, UserProfile, LoadUserProfileResult } from './interfaces'

export interface Prescription {
  id?: string;
  drug_name?: string;
  frequency?: string;
  start_timestamp?: Date;
  end_timestamp?: Date;
  patient_id?: string;
  consultation_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export enum ConsultationState {
  CLERKING = "CLERKING",
  CONSULTING = "CONSULTING"
}

export interface Consultation {
  id: string;
  state?: ConsultationState;
  prescription_assistance?: string;
  prescription_assistance_state?: string;
  patient_id?: string;
  clerk_id?: string;
  doctor_id?: string;
  messages?: Message[];
  prescriptions?: Prescription[];
  created_at?: Date;
  updated_at?: Date;
}

export interface Doctor {
  id?: string;
  language?: string;
  specialty?: string;
}

export interface Message {
  id: string;
  translated_content?: string;
  translated_language?: string;
  original_language?: string;
  original_content?: string;
  llm_language?: string;
  llm_content?: string;
  state?: string;
  sender_id?: string;
  consultation_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface QueryGeneration {
  query?: string;
}

export interface AgentState {
  conversation?: Message[];
  last_inserted_message_by_user?: Message;
  query?: string;
  medical_specialty?: string;
  refined_query?: string;
  context_retrieved?: string;
  consultation?: Consultation;
  next_message_to_append?: Message;
  doctor?: Doctor;
  doctor_selection_rationale?: string;
  medical_consultation_summary?: string;
  messages?: any[];
}

export interface GradeDocuments {
  binary_score: "YES" | "NO";
}

export interface RewrittenQuestion {
  improved_question: string;
}

export interface GeneratedMessage {
  message_content: string;
}


export type MedicalSpecialty =
  | "General Medicine"
  | "Cardiology"
  | "Dermatology"
  | "Endocrinology"
  | "Gastroenterology"
  | "Neurology"
  | "Oncology"
  | "Orthopedics"
  | "Pediatrics"
  | "Psychiatry"
  | "Pulmonology"
  | "Radiology"
  | "Surgery"
  | "Urology";

export interface MedicalSpecialtyResponse {
  specialty: MedicalSpecialty;
}

export interface DoctorSelectionRationale {
  rationale: string;
}

export interface TranslatedMessage {
  translated_content: string;
}

export interface DoctorSelection {
  binary_answer: "yes" | "no";
}

export interface PrescriptionRecommendation {
  recommendations: string;
}

export interface PrescriptionData {
  drug_name: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionList {
  prescriptions: PrescriptionData[];
}
