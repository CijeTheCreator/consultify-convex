"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ConvexTypeGuards } from "@/lib/convex-services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Pill, Languages } from "lucide-react"
import type { User } from "@/lib/types"
import PrescriptionModal from "./prescription-modal"
import { toast } from "sonner"
import { useAction } from "convex/react"

interface ConsultationChatProps {
  consultationId: string
  currentUser: User
  onBack: () => void
  fromAITriage?: boolean
}

interface MessageDisplay {
  id: string
  sender_id: string
  original_content?: string
  original_language?: string
  translated_content?: string
  translated_language?: string
  llm_content: string
  llm_language: string
  state?: string
  created_at: string
  updated_at: string
}

// Translation object
const translations = {
  en: {
    loading: "Loading...",
    patient: "patient",
    doctor: "doctor",
    connectedViaAI: "Connected via AI Triage",
    typeMessage: "Type your message...",
    sendPrescription: "Send Prescription",
    welcomeMessage: "You've been connected to your doctor. Your symptoms have been reviewed.",
    failedToFetch: "Failed to fetch messages:",
    failedToSend: "Failed to send message:",
    failedToSendTyping: "Failed to send typing indicator:",
    failedToMarkRead: "Failed to mark message as read:",
    failedToSendPrescription: "Failed to send prescription:",
    otherUser: "Other User",
    translating: "Translating..."
  },
  fr: {
    loading: "Chargement...",
    patient: "patient",
    doctor: "médecin",
    connectedViaAI: "Connecté via Triage IA",
    typeMessage: "Tapez votre message...",
    sendPrescription: "Envoyer l'ordonnance",
    welcomeMessage: "Vous avez été connecté à votre médecin. Vos symptômes ont été examinés.",
    failedToFetch: "Échec de la récupération des messages:",
    failedToSend: "Échec de l'envoi du message:",
    failedToSendTyping: "Échec de l'envoi de l'indicateur de saisie:",
    failedToMarkRead: "Échec du marquage du message comme lu:",
    failedToSendPrescription: "Échec de l'envoi de l'ordonnance:",
    otherUser: "Autre utilisateur",
    translating: "Traduction..."
  }
}


export default function ConsultationChat({ consultationId, currentUser, onBack, fromAITriage }: ConsultationChatProps) {
  const [input, setInput] = useState("")
  const [otherParticipant, setOtherParticipant] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Convert string IDs to Convex IDs
  const convexConsultationId = ConvexTypeGuards.toConsultationId(consultationId)
  const convexUserId = ConvexTypeGuards.toUserId(currentUser.id)

  // Real-time Convex queries
  const consultation = useQuery(api.consultations.getConsultation, { consultationId: convexConsultationId })
  const messagesData = useQuery(api.messages.getMessagesByConsultation, { consultationId: convexConsultationId })
  const sendMessageMutation = useMutation(api.messages.sendMessage)
  const updateMessageMutation = useMutation(api.messages.updateMessage)
  const createPrescriptionMutation = useMutation(api.prescriptions.createPrescription)

  // Transform messages to display format
  const messages: MessageDisplay[] = messagesData?.map(msg => ({
    id: msg.id,
    sender_id: msg.sender_id,
    original_content: msg.original_content,
    original_language: msg.original_language,
    translated_content: msg.translated_content,
    translated_language: msg.translated_language,
    llm_content: msg.llm_content,
    llm_language: msg.llm_language,
    state: msg.state,
    created_at: msg.created_at,
    updated_at: msg.updated_at
  })) || []

  const isLoadingMessages = messagesData === undefined

  // Get translations based on user role
  const t = currentUser.language === "en" ? translations.en : translations.fr

  const currentUserLanguage = currentUser.language

  useEffect(() => {
    if (fromAITriage && messages.length > 0) {
      // Show a brief welcome message about the transition
      const welcomeMessage = t.welcomeMessage
      // This could be shown as a system message or notification
    }
  }, [fromAITriage, messages, t.welcomeMessage])

  // Set other participant when consultation data is loaded
  useEffect(() => {
    if (consultation) {
      // Set other participant based on consultation details
      if (consultation.patient_id && consultation.doctor_id) {
        const isPatient = convexUserId === consultation.patient_id
        setOtherParticipant({
          id: isPatient ? consultation.doctor_id : consultation.patient_id,
          name: isPatient ? "Doctor" : "Patient",
          role: isPatient ? "doctor" : "patient"
        })
      } else if (consultation.patient_id && consultation.state === "CLERKING") {
        // Only patient is present, in clerking mode
        setOtherParticipant({
          id: "clerk_agent",
          name: "Clerk Agent",
          role: "clerk"
        })
      }
    }
  }, [consultation, convexUserId])

  // Handle input change (simplified - no typing indicators)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const determineRoute = useAction(api.routeMessageAction.routeMessageAction)
  const selectDoctor = useAction(api.selectDoctorAction.selectDoctorAction)
  const translateMessage = useAction(api.translateMessageAction.translateMessageAction)
  const generateResponse = useAction(api.generateResponseAction.generateResponseAction)
  // Send message and invoke clerking graph
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !consultation) return

    const messageContent = input.trim()
    setInput("")
    setIsProcessing(true)

    try {
      // Save the user message using Convex mutation
      const savedMessage = await sendMessageMutation({
        senderId: convexUserId,
        consultationId: convexConsultationId,
        originalContent: messageContent,
        originalLanguage: currentUser.language,
        llm_content: messageContent,
        llm_language: currentUser.language,
        state: "completed"
      })

      const route = await determineRoute({ consultationId: convexConsultationId })

      if (route == "Translate") {
        translateMessage({ messageId: savedMessage.id })
      }

      if (route == "Select Doctor") {
        selectDoctor({ consultationId: convexConsultationId })
      }

      if (route == "Generate Response") {
        generateResponse({ consultationId: convexConsultationId })
      }


    } catch (error) {
      console.error(t.failedToSend, error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const sendPrescription = async (medications: any[]) => {
    try {
      const patientId = currentUser.type === "PATIENT" ? convexUserId : consultation?.patient_id
      
      if (!patientId) {
        throw new Error("Patient ID not found")
      }

      for (const medication of medications) {
        await createPrescriptionMutation({
          drugName: medication.drug_name,
          frequency: medication.frequency,
          startTimestamp: medication.startDate?.getTime() || Date.now(),
          endTimestamp: medication.endDate?.getTime() || Date.now() + (7 * 24 * 60 * 60 * 1000),
          patientId: patientId,
          consultationId: convexConsultationId
        })
      }

      toast.success("Prescription sent successfully")
    } catch (error) {
      console.error(t.failedToSendPrescription, error)
      toast.error("Failed to send prescription. Please try again.")
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Auto-scroll when messages change (real-time updates)
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Helper function to determine if message is from current user
  const isCurrentUserMessage = (message: MessageDisplay) => {
    return message.sender_id === currentUser.id
  }

  // Helper function to get sender name for display
  const getSenderName = (message: MessageDisplay) => {
    if (message.sender_id === currentUser.id) {
      return currentUser.name
    }

    // For clerk/agent messages
    if (message.sender_id === "clerk_agent") {
      return "Clerk Agent"
    }

    // For other users, show role-based names
    if (currentUser.type === "PATIENT") {
      return "Doctor"
    } else {
      return "Patient"
    }
  }

  // Helper function to get message content with proper translation based on user role
  const getMessageContent = (message: MessageDisplay) => {
    const currentUserLang = currentUser.language

    // Always show content in the current user's language
    // If the message's original language matches the current user's language, show original
    if (message.original_language === currentUserLang && message.original_content) {
      return message.original_content
    }
    // If the message's translated language matches the current user's language, show translated
    else if (message.translated_language === currentUserLang && message.translated_content) {
      return message.translated_content
    }
    // Default to llm_content
    else {
      return message.llm_content
    }
  }

  // Helper function to check if message needs translation but translation isn't ready
  const isTranslationPending = (message: MessageDisplay) => {
    const currentUserLang = currentUser.language

    // If we're in CONSULTING mode and the message is from another user
    if (consultation?.state === "CONSULTING" && message.sender_id !== currentUser.id) {
      // If the original language is different from current user's language
      if (message.original_language && message.original_language !== currentUserLang) {
        // And translation is not available yet
        if (!message.translated_content || message.translated_language !== currentUserLang) {
          return true
        }
      }
    }

    return false
  }

  // Helper function to get message status icon and loading state
  const getMessageStatusIcon = (message: MessageDisplay) => {
    if (message.sender_id !== currentUser.id) return null

    // Show checkmark if message is completed
    return <span className="text-green-500 text-xs">✓</span>
  }

  // Helper function to check if message is still loading (no content)
  const isMessageLoading = (message: MessageDisplay) => {
    // Check if there's no meaningful content
    const hasOriginalContent = message.original_content && message.original_content.trim().length > 0
    const hasTranslatedContent = message.translated_content && message.translated_content.trim().length > 0
    const hasLlmContent = message.llm_content && message.llm_content.trim().length > 0

    // If no content at all, it's loading
    if (!hasOriginalContent && !hasTranslatedContent && !hasLlmContent) {
      return true
    }

    // If only llm_content exists and it's just a short string (likely language code), it's loading
    if (!hasOriginalContent && !hasTranslatedContent && hasLlmContent) {
      const content = message.llm_content.trim()
      // Consider it loading if content is very short (like "en", "fr") or just language codes
      if (content.length <= 3 || /^[a-z]{2,3}$/i.test(content)) {
        return true
      }
    }

    return false
  }

  // Helper function to get loading progress text
  const getLoadingProgress = (message: MessageDisplay) => {
    if (message.state) {
      return message.state
    }
    return "Processing..."
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <Card className="w-full max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {otherParticipant?.name?.charAt(0).toUpperCase() || (currentUser.type === "PATIENT" ? "Dr" : "P")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {currentUser.type === "PATIENT" ? "" : ""}
                  {otherParticipant?.name || t.loading}
                </CardTitle>
                {otherParticipant?.specialization && (
                  <p className="text-sm text-gray-600">{otherParticipant.specialization}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{currentUser.type}</Badge>
              {consultation?.state && (
                <div className={`text-xs px-2 py-1 rounded ${consultation.state === "CLERKING" ? "text-orange-600 bg-orange-50" :
                  consultation.state === "CONSULTING" ? "text-green-600 bg-green-50" :
                    "text-purple-600 bg-purple-50"
                  }`}>
                  {consultation.state}
                </div>
              )}
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1">
                <Languages className="w-3 h-3" />
                <span>{currentUserLanguage.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">{t.loading}</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isLoadingMessage = isMessageLoading(message)
                const isTranslatingMessage = isTranslationPending(message)
                const isAgentMessage = message.sender_id === "clerk_agent"

                return (
                  <div key={message.id} className="animate-in fade-in duration-300">
                    <div className={`flex ${isCurrentUserMessage(message) ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUserMessage(message) ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getSenderName(message).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div
                          className={`rounded-lg px-3 py-2 ${isCurrentUserMessage(message) ? "bg-blue-500 text-white" : "bg-white border text-gray-900"
                            }`}
                        >
                          <div className="flex items-start space-x-2">
                            {isLoadingMessage || isTranslatingMessage ? (
                              <div className="text-sm flex-1 text-gray-500 italic">
                                {isTranslatingMessage ? t.translating : getLoadingProgress(message)}
                                <div className="flex space-x-1 mt-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm flex-1">{getMessageContent(message)}</p>
                                {!isCurrentUserMessage(message) &&
                                  message.translated_content &&
                                  message.translated_content !== message.original_content && (
                                    <Languages className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                  )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {getMessageStatusIcon(message)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex justify-center">
                  <div className="text-xs text-gray-500 italic">
                    Processing message...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <CardFooter className="p-4 border-t">
          <div className="flex w-full space-x-2">
            <form onSubmit={sendMessage} className="flex flex-1 space-x-2">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={t.typeMessage}
                className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <Button type="submit" disabled={!input.trim() || isProcessing}>
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {currentUser.type === "DOCTOR" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPrescriptionModal(true)}
                className="whitespace-nowrap"
              >
                <Pill className="w-4 h-4 mr-2" />
                {t.sendPrescription}
              </Button>
            )}
          </div>

          <PrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            onSend={sendPrescription}
            patientName={otherParticipant?.name || "Patient"}
            consultationId={consultationId}
          />

        </CardFooter>
      </Card>
    </div>
  )
}
