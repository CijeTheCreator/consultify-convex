export interface User {
  id: string
  name: string
  email: string
  language: string
  type: "PATIENT" | "DOCTOR" | "CLERK"
  specialty?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  language: string
  type: "PATIENT" | "DOCTOR" | "CLERK"
  specialty?: string
}

export interface Consultation {
  id: string
  state: string
  patientId: string
  doctorId: string | null
  patient: User
  doctor: User | null
  createdAt: string
}

export type LoadUserProfileResult = {
  success: true
  user: User
} | {
  success: false
  error: string
  redirectToAuth: boolean
}

export type LoadConsultationsResult = {
  success: true
  consultations: Consultation[]
} | {
  success: false
  error: string
}

export interface DoctorUser {
  id: string
  name: string
  language: string
  specialization: string
}

export interface PatientUser {
  id: string
  name: string
  language: string
}

export interface DoctorUserData {
  id: string
  name: string
  type: string
  specialty: string
  language: string
  consultationsAsDoctor: any[]
}

export interface PatientUserData {
  id: string
  name: string
  type: string
  language: string
  consultationsAsPatient: any[]
}

export interface DoctorStats {
  consultations: number
  messages: number
  recentConsultations: Array<{
    id: string
    patientId?: string
    status: string
    createdAt: string
    consultationType: string
  }>
}

export interface PatientStats {
  consultations: number
  messages: number
  recentConsultations: Array<{
    id: string
    doctorId?: string
    status: string
    createdAt: string
    consultationType: string
  }>
}

export type LoadDoctorProfileResult = {
  success: true
  user: DoctorUser
  userData: DoctorUserData
} | {
  success: false
  error: string
  accessDenied?: boolean
}

export type LoadPatientProfileResult = {
  success: true
  user: PatientUser
  userData: PatientUserData
} | {
  success: false
  error: string
  accessDenied?: boolean
}

export type LoadDoctorStatsResult = {
  success: true
  stats: DoctorStats
} | {
  success: false
  error: string
}

export type LoadPatientStatsResult = {
  success: true
  stats: PatientStats
} | {
  success: false
  error: string
}

export type CreateConsultationResult = {
  success: true
  consultation: {
    id: string
    patientId: string
    status: string
  }
} | {
  success: false
  error: string
}

export interface Prescription {
  id: string
  drugName: string
  frequency: string
  startTimestamp: string
  endTimestamp: string
  patientId: string
  consultationId: string
  patient: {
    id: string
    name: string
    email: string
  }
  consultation: {
    id: string
    state: string
  }
  createdAt: string
  updatedAt: string
}

export type LoadPrescriptionsResult = {
  success: true
  prescriptions: Prescription[]
} | {
  success: false
  error: string
}

export interface Notification {
  id: string
  type: 'SYSTEM' | 'CONSULTATION' | 'PRESCRIPTION'
  title: string
  message: string
  read: boolean
  userId: string
  consultationId?: string
  createdAt: string
  updatedAt: string
}

export type LoadNotificationsResult = {
  success: true
  notifications: Notification[]
} | {
  success: false
  error: string
}

export type CreateNotificationResult = {
  success: true
  notification: Notification
} | {
  success: false
  error: string
}

export type MarkNotificationReadResult = {
  success: true
} | {
  success: false
  error: string
}

export interface Message {
  id?: string;
  translated_content?: string;
  translated_language?: string;
  original_language?: string;
  original_content?: string;
  llm_language?: string;
  llm_content?: string;
  state?: string;
  sender_id?: string;
  consultation_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Doctor {
  id?: string;
  language?: string;
  specialty?: string;
}

export interface HelpersPrescription {
  id?: string;
  drug_name?: string;
  frequency?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  patient_id?: string;
  consultation_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HelpersConsultation {
  id?: string;
  state?: ConsultationState;
  prescription_assistance?: string;
  prescription_assistance_state?: string;
  patient_id?: string;
  clerk_id?: string;
  doctor_id?: string;
  messages?: Message[];
  prescriptions?: HelpersPrescription[];
  created_at?: string;
  updated_at?: string;
}

export enum ConsultationState {
  CLERKING = "CLERKING",
  CONSULTING = "CONSULTING"
}

export interface AgentState {
  conversation?: Message[];
  last_inserted_message_by_user?: Message;
  query?: string;
  medical_specialty?: string;
  refined_query?: string;
  context_retrieved?: string;
  consultation?: HelpersConsultation;
  next_message_to_append?: Message;
  doctor?: Doctor;
  doctor_selection_rationale?: string;
  medical_consultation_summary?: string;
  messages?: any[];
}

export interface PrescriptionAgentState {
  conversation?: Message[];
  query?: string;
  refined_query?: string;
  context_retrieved?: string;
  consultation?: HelpersConsultation;
  prescriptions_recommended?: HelpersPrescription[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  consultation_id?: string;
  error?: string;
}

export interface RegisterUserData {
  email: string;
  name: string;
  type: string;
  specialty?: string | null;
  language: string;
}

export type RegisterUserResult = {
  success: true;
  user: User;
} | {
  success: false;
  error: string;
}

export type CheckUserExistsResult = {
  success: true;
  userExists: boolean;
  user?: User;
} | {
  success: false;
  error: string;
}
