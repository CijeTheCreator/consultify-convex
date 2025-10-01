// TypeScript interfaces based on models.py schemas

export interface Prescription {
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

export enum ConsultationState {
  CLERKING = "CLERKING",
  CONSULTING = "CONSULTING"
}

export interface Consultation {
  id?: string;
  state?: ConsultationState;
  prescription_assistance?: string;
  prescription_assistance_state?: string;
  patient_id?: string;
  clerk_id?: string;
  doctor_id?: string;
  messages?: Message[];
  prescriptions?: Prescription[];
  created_at?: string;
  updated_at?: string;
}

export interface Doctor {
  id?: string;
  language?: string;
  specialty?: string;
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

export interface PrescriptionAgentState {
  conversation?: Message[];
  query?: string;
  refined_query?: string;
  context_retrieved?: string;
  consultation?: Consultation;
  prescriptions_recommended?: Prescription[];
}

// API Response interfaces
export interface ApiResponse {
  success: boolean;
  message?: string;
  consultation_id?: string;
  error?: string;
}

// API Helper Functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';

export async function invokeClerkingGraph(data: AgentState): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/clerking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log("Response sent")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error invoking clerking graph:', error);
    throw error;
  }
}

export async function invokePrescriptionGraph(data: PrescriptionAgentState): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/prescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error invoking prescription graph:', error);
    throw error;
  }
}

export async function healthCheck(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
}

// Unimplemented getter functions - awaiting implementation
export async function getConversation(consultationId: string): Promise<Message[]> {
  try {
    const response = await fetch(`/api/consultations/${consultationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages = await response.json();

    // Transform the response to match the Message interface
    return messages.map((msg: any) => ({
      id: msg.id,
      translated_content: msg.translatedContent,
      translated_language: msg.translatedLanguage,
      original_language: msg.originalLanguage,
      original_content: msg.originalContent,
      llm_language: msg.llm_language,
      llm_content: msg.llm_content,
      state: msg.state,
      sender_id: msg.senderId,
      consultation_id: msg.consultationId,
      created_at: msg.createdAt,
      updated_at: msg.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

export async function getConsultation(consultationId: string): Promise<Consultation> {
  try {
    const response = await fetch(`/api/consultations?id=${consultationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const consultation = await response.json();

    // Transform the response to match the Consultation interface
    return {
      id: consultation.id,
      state: consultation.state as ConsultationState,
      prescription_assistance: consultation.prescriptionAssistance,
      prescription_assistance_state: consultation.prescriptionAssistanceState,
      patient_id: consultation.patientId,
      clerk_id: consultation.clerkId,
      doctor_id: consultation.doctorId,
      messages: consultation.messages || [],
      prescriptions: consultation.prescriptions || [],
      created_at: consultation.createdAt,
      updated_at: consultation.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching consultation:', error);
    throw error;
  }
}

export async function getNextMessageToAppend(consultationId: string): Promise<Message | null> {
  // TODO: Implement next message to append getter
  throw new Error('Not implemented');
}

export async function getLastInsertedMessageByUser(consultationId: string): Promise<Message | null> {
  // TODO: Implement last inserted message by user getter
  throw new Error('Not implemented');
}

export async function getPrescriptionAssistance(consultationId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/consultations/${consultationId}/prescription-assistance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.prescriptionAssistance;
  } catch (error) {
    console.error('Error fetching prescription assistance:', error);
    throw error;
  }
}

export async function getPrescriptionAssistanceState(consultationId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/consultations/${consultationId}/prescription-assistance-state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.prescriptionAssistanceState;
  } catch (error) {
    console.error('Error fetching prescription assistance state:', error);
    throw error;
  }
}

export async function getPrescriptionsByConsultation(consultationId: string): Promise<Prescription[]> {
  try {
    const response = await fetch(`/api/prescriptions?consultationId=${consultationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const prescriptions = await response.json();
    
    // Transform the response to match the Prescription interface
    return prescriptions.map((prescription: any) => ({
      id: prescription.id,
      drug_name: prescription.drugName,
      frequency: prescription.frequency,
      start_timestamp: prescription.startTimestamp,
      end_timestamp: prescription.endTimestamp,
      patient_id: prescription.patientId,
      consultation_id: prescription.consultationId,
      created_at: prescription.createdAt,
      updated_at: prescription.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw error;
  }
}
