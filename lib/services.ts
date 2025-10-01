import type { 
  User, 
  UserProfile, 
  LoadUserProfileResult, 
  Consultation, 
  LoadConsultationsResult,
  DoctorUser,
  PatientUser,
  DoctorUserData,
  PatientUserData,
  DoctorStats,
  PatientStats,
  LoadDoctorProfileResult,
  LoadPatientProfileResult,
  LoadDoctorStatsResult,
  LoadPatientStatsResult,
  CreateConsultationResult,
  Prescription,
  LoadPrescriptionsResult,
  Notification,
  LoadNotificationsResult,
  CreateNotificationResult,
  MarkNotificationReadResult,
  Message,
  HelpersConsultation,
  HelpersPrescription,
  AgentState,
  PrescriptionAgentState,
  ApiResponse,
  RegisterUserData,
  RegisterUserResult,
  CheckUserExistsResult
} from './interfaces'

import { 
  invokeClerkingGraph, 
  invokePrescriptionGraph,
  getConversation,
  getConsultation,
  getPrescriptionAssistance,
  getPrescriptionAssistanceState,
  getPrescriptionsByConsultation 
} from './helpers'

export class UserService {
  static async loadUserProfile(userEmail: string): Promise<LoadUserProfileResult> {
    try {
      const response = await fetch(`/api/users?email=${userEmail}`)
      
      if (!response.ok) {
        console.error('Failed to fetch user profile - user may not exist in database')
        return {
          success: false,
          error: 'Failed to fetch user profile',
          redirectToAuth: true
        }
      }

      const userProfile: UserProfile = await response.json()
      
      const user: User = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        type: userProfile.type,
        language: userProfile.language,
        specialty: userProfile.specialty
      }

      return {
        success: true,
        user
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      return {
        success: false,
        error: 'Network error while loading user profile',
        redirectToAuth: true
      }
    }
  }

  static async registerUser(userData: RegisterUserData): Promise<RegisterUserResult> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to save user to database')
      }

      const createdUser = await response.json()
      
      const user: User = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        type: createdUser.type,
        language: createdUser.language,
        specialty: createdUser.specialty
      }

      return {
        success: true,
        user
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      }
    }
  }

  static async checkUserExists(userEmail: string): Promise<CheckUserExistsResult> {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`)
      
      if (response.ok) {
        const userData = await response.json()
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          type: userData.type,
          language: userData.language,
          specialty: userData.specialty
        }
        
        return {
          success: true,
          userExists: true,
          user
        }
      } else if (response.status === 404) {
        return {
          success: true,
          userExists: false
        }
      } else {
        throw new Error('Failed to check user status')
      }
    } catch (error) {
      console.error('Error checking user status:', error)
      return {
        success: false,
        error: 'Network error while checking user status'
      }
    }
  }
}

export class ConsultationService {
  static async loadConsultations(userId: string, userType: string): Promise<LoadConsultationsResult> {
    try {
      const response = await fetch(`/api/consultations?userId=${userId}&userType=${userType}`)
      
      if (!response.ok) {
        console.error('Failed to fetch consultations')
        return {
          success: false,
          error: 'Failed to fetch consultations'
        }
      }

      const consultationsData: Consultation[] = await response.json()
      
      return {
        success: true,
        consultations: consultationsData || []
      }
    } catch (error) {
      console.error('Error loading consultations:', error)
      return {
        success: false,
        error: 'Network error while loading consultations'
      }
    }
  }

  static async createConsultation(patientId: string): Promise<CreateConsultationResult> {
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          status: 'ACTIVE'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || 'Failed to create consultation'
        }
      }

      const consultation = await response.json()
      
      return {
        success: true,
        consultation: {
          id: consultation.id,
          patientId: consultation.patientId,
          status: consultation.status
        }
      }
    } catch (error) {
      console.error('Error creating consultation:', error)
      return {
        success: false,
        error: 'Network error while creating consultation'
      }
    }
  }
}

export class DoctorService {
  static async loadDoctorProfile(userEmail: string): Promise<LoadDoctorProfileResult> {
    try {
      const response = await fetch(`/api/users?email=${userEmail}`)
      
      if (!response.ok) {
        console.error('Failed to fetch doctor profile - user may not exist in database')
        return {
          success: false,
          error: 'User not found in database'
        }
      }

      const data: DoctorUserData = await response.json()
      
      if (data.type !== 'DOCTOR') {
        return {
          success: false,
          error: 'Access denied: This page is for doctors only',
          accessDenied: true
        }
      }

      const user: DoctorUser = {
        id: data.id,
        name: data.name,
        language: data.language,
        specialization: data.specialty || 'General Medicine'
      }

      return {
        success: true,
        user,
        userData: data
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error)
      return {
        success: false,
        error: 'Network error while loading doctor profile'
      }
    }
  }

  static async loadDoctorStats(userId: string): Promise<LoadDoctorStatsResult> {
    try {
      const response = await fetch(`/api/users?id=${userId}`)
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch doctor stats'
        }
      }

      const userData = await response.json()
      const consultationsCount = userData.consultationsAsDoctor?.length || 0
      const totalMessages = userData.consultationsAsDoctor?.reduce((sum: number, consultation: any) => 
        sum + (consultation.messages?.length || 0), 0) || 0
      
      const stats: DoctorStats = {
        consultations: consultationsCount,
        messages: totalMessages,
        recentConsultations: userData.consultationsAsDoctor?.slice(0, 3).map((consultation: any) => ({
          id: consultation.id,
          patientId: consultation.patientId,
          status: consultation.status,
          createdAt: consultation.createdAt,
          consultationType: "DOCTOR"
        })) || []
      }

      return {
        success: true,
        stats
      }
    } catch (error) {
      console.error('Error loading doctor stats:', error)
      return {
        success: false,
        error: 'Network error while loading doctor stats'
      }
    }
  }
}

export class PatientService {
  static async loadPatientProfile(userEmail: string): Promise<LoadPatientProfileResult> {
    try {
      const response = await fetch(`/api/users?email=${userEmail}`)
      
      if (!response.ok) {
        console.error('Failed to fetch patient profile - user may not exist in database')
        return {
          success: false,
          error: 'User not found in database'
        }
      }

      const data: PatientUserData = await response.json()
      
      if (data.type !== 'PATIENT') {
        return {
          success: false,
          error: 'Access denied: This page is for patients only',
          accessDenied: true
        }
      }

      const user: PatientUser = {
        id: data.id,
        name: data.name,
        language: data.language
      }

      return {
        success: true,
        user,
        userData: data
      }
    } catch (error) {
      console.error('Error loading patient profile:', error)
      return {
        success: false,
        error: 'Network error while loading patient profile'
      }
    }
  }

  static async loadPatientStats(userId: string): Promise<LoadPatientStatsResult> {
    try {
      const response = await fetch(`/api/users?id=${userId}`)
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch patient stats'
        }
      }

      const userData = await response.json()
      const consultationsCount = userData.consultationsAsPatient?.length || 0
      const totalMessages = userData.consultationsAsPatient?.reduce((sum: number, consultation: any) => 
        sum + (consultation.messages?.length || 0), 0) || 0
      
      const stats: PatientStats = {
        consultations: consultationsCount,
        messages: totalMessages,
        recentConsultations: userData.consultationsAsPatient?.slice(0, 3).map((consultation: any) => ({
          id: consultation.id,
          doctorId: consultation.doctorId,
          status: consultation.status,
          createdAt: consultation.createdAt,
          consultationType: consultation.doctorId ? "DOCTOR" : "AI_TRIAGE"
        })) || []
      }

      return {
        success: true,
        stats
      }
    } catch (error) {
      console.error('Error loading patient stats:', error)
      return {
        success: false,
        error: 'Network error while loading patient stats'
      }
    }
  }
}

export class PrescriptionService {
  static async loadPrescriptions(patientId: string): Promise<LoadPrescriptionsResult> {
    try {
      const response = await fetch(`/api/prescriptions?patientId=${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch prescriptions')
        return {
          success: false,
          error: 'Failed to fetch prescriptions'
        }
      }

      const prescriptions: Prescription[] = await response.json()
      
      return {
        success: true,
        prescriptions: prescriptions || []
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      return {
        success: false,
        error: 'Network error while loading prescriptions'
      }
    }
  }
}

export class NotificationService {
  static async loadNotifications(userId: string): Promise<LoadNotificationsResult> {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch notifications')
        return {
          success: false,
          error: 'Failed to fetch notifications'
        }
      }

      const notifications: Notification[] = await response.json()
      
      return {
        success: true,
        notifications: notifications || []
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      return {
        success: false,
        error: 'Network error while loading notifications'
      }
    }
  }

  static async createNotification(
    userId: string,
    type: 'SYSTEM' | 'CONSULTATION' | 'PRESCRIPTION',
    title: string,
    message: string,
    consultationId?: string
  ): Promise<CreateNotificationResult> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          title,
          message,
          consultationId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || 'Failed to create notification'
        }
      }

      const notification: Notification = await response.json()
      
      return {
        success: true,
        notification
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      return {
        success: false,
        error: 'Network error while creating notification'
      }
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<MarkNotificationReadResult> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          read: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || 'Failed to mark notification as read'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return {
        success: false,
        error: 'Network error while updating notification'
      }
    }
  }
}

export class ChatService {
  static async getConsultationDetails(consultationId: string): Promise<HelpersConsultation | null> {
    try {
      return await getConsultation(consultationId)
    } catch (error) {
      console.error('Failed to fetch consultation details:', error)
      return null
    }
  }

  static async getMessages(consultationId: string): Promise<Message[]> {
    try {
      return await getConversation(consultationId)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    }
  }

  static async sendMessage(messageData: {
    senderId: string
    consultationId: string
    originalContent: string
    originalLanguage: string
    llm_content: string
    llm_language: string
    state: string
  }): Promise<any> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      if (!response.ok) {
        throw new Error('Failed to save message to database')
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  static async invokeClerkingAgent(agentState: AgentState): Promise<ApiResponse> {
    try {
      return await invokeClerkingGraph(agentState)
    } catch (error) {
      console.error('Error invoking clerking graph:', error)
      throw error
    }
  }

  static async handleVerifyAttestation(attestation: string): Promise<boolean> {
    try {
      const response = await fetch('http://72.46.85.207:8734/~cc@1.0/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: attestation
      })

      const result = await response.json()
      return result === true
    } catch (error) {
      console.error('Verification error:', error)
      throw error
    }
  }
}

export class PrescriptionModalService {
  static async invokePrescriptionAgent(prescriptionAgentData: PrescriptionAgentState): Promise<ApiResponse> {
    try {
      return await invokePrescriptionGraph(prescriptionAgentData)
    } catch (error) {
      console.error('Failed to start AI analysis:', error)
      throw error
    }
  }

  static async getPrescriptionAssistanceData(consultationId: string): Promise<{
    assistanceContent: string | null
    assistanceState: string | null
    prescriptions: HelpersPrescription[]
  }> {
    try {
      const [assistanceContent, assistanceState, prescriptions] = await Promise.all([
        getPrescriptionAssistance(consultationId),
        getPrescriptionAssistanceState(consultationId),
        getPrescriptionsByConsultation(consultationId)
      ])

      return {
        assistanceContent,
        assistanceState,
        prescriptions: prescriptions || []
      }
    } catch (error) {
      console.error('Error polling prescription data:', error)
      throw error
    }
  }

  static async getConversationForPrescription(consultationId: string): Promise<Message[]> {
    try {
      return await getConversation(consultationId)
    } catch (error) {
      console.error('Error getting conversation for prescription:', error)
      throw error
    }
  }
}