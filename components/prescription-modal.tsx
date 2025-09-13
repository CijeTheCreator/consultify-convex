"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Trash2, Brain, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { PrescriptionAgentState, HelpersPrescription, HelpersConsultation, Message } from "@/lib/interfaces"

interface Medication {
  drug_name: string
  amount: string
  frequency: string
  startDate: Date | undefined
  endDate: Date | undefined
}

interface PrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (medications: Medication[]) => void
  patientName: string
  consultationId: string
  language?: "en" | "fr"
}

// Default reasoning steps for when state is not available
const DEFAULT_REASONING_STEPS = [
  "Analyzing patient consultation history...",
  "Evaluating symptoms and medical context...",
  "Generating prescription recommendations...",
]

const translations = {
  en: {
    title: "Send Prescription",
    description: "Create a prescription for",
    medication: "Medication",
    drugName: "Drug Name",
    amount: "Amount",
    frequency: "Frequency",
    startDate: "Start Date",
    endDate: "End Date",
    action: "Action",
    addAnother: "Add Another Medication",
    cancel: "Cancel",
    sendPrescription: "Send Prescription",
    aiAnalysis: "Prescription Assist",
    analyzing: "Analyzing...",
    placeholders: {
      drug: "e.g., Amoxicillin 500mg",
      amount: "e.g., 1 tablet",
      frequency: "e.g., 3",
      startDate: "Start date",
      endDate: "End date"
    }
  },
  fr: {
    title: "Envoyer l'ordonnance",
    description: "Créer une ordonnance pour",
    medication: "Médicament",
    drugName: "Nom du médicament",
    amount: "Quantité",
    frequency: "Fréquence",
    startDate: "Date de début",
    endDate: "Date de fin",
    action: "Action",
    addAnother: "Ajouter un autre médicament",
    cancel: "Annuler",
    sendPrescription: "Envoyer l'ordonnance",
    aiAnalysis: "Analyse IA",
    analyzing: "Analyse...",
    placeholders: {
      drug: "ex: Amoxicilline 500mg",
      amount: "ex: 1 comprimé",
      frequency: "ex: 3",
      startDate: "Date de début",
      endDate: "Date de fin"
    }
  }
}

export default function PrescriptionModal({ isOpen, onClose, onSend, patientName, consultationId, language = "en" }: PrescriptionModalProps) {
  const [medications, setMedications] = useState<Medication[]>([{ drug_name: "", amount: "", frequency: "", startDate: undefined, endDate: undefined }])
  const t = translations[language]

  // AI reasoning state management
  const [isThinking, setIsThinking] = useState(false)
  const [currentReasoning, setCurrentReasoning] = useState<string[]>([])
  const [reasoningIndex, setReasoningIndex] = useState(0)
  const [showAiAnalysis, setShowAiAnalysis] = useState(false)
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false)
  const [prescriptionAssistanceContent, setPrescriptionAssistanceContent] = useState<string>("")
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Fun medical thinking words to cycle through
  const thinkingWords = [
    "Diagnosing",
    "Analyzing",
    "Evaluating",
    "Assessing",
    "Reviewing",
    "Calculating"
  ]
  const [currentThinkingWordIndex, setCurrentThinkingWordIndex] = useState(0)

  const addMedication = () => {
    setMedications([...medications, { drug_name: "", amount: "", frequency: "", startDate: undefined, endDate: undefined }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string | Date | undefined) => {
    const updated = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updated)
  }

  const handleSend = () => {
    const validMedications = medications.filter(
      (med) => med.drug_name.trim() && med.amount.trim() && med.frequency.trim() && med.startDate && med.endDate,
    )

    if (validMedications.length > 0) {
      onSend(validMedications)
      setMedications([{ drug_name: "", amount: "", frequency: "", startDate: undefined, endDate: undefined }])
      onClose()
    }
  }

  const handleClose = () => {
    setMedications([{ drug_name: "", amount: "", frequency: "", startDate: undefined, endDate: undefined }])
    setShowAiAnalysis(false)
    setAiAnalysisComplete(false)
    setIsThinking(false)
    setPrescriptionAssistanceContent("")

    // Clear polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }

    onClose()
  }

  // Cycle through thinking words when thinking is active
  useEffect(() => {
    if (!isThinking) return

    const interval = setInterval(() => {
      setCurrentThinkingWordIndex(prev => (prev + 1) % thinkingWords.length)
    }, 1000) // Change word every 1 second

    return () => clearInterval(interval)
  }, [isThinking, thinkingWords.length])

  // Cleanup polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])



  // Convert database prescription to form medication
  const convertPrescriptionToMedication = (prescription: HelpersPrescription): Medication => {
    return {
      drug_name: prescription.drug_name || '',
      amount: '1 tablet', // Default amount as it's not in the prescription schema
      frequency: prescription.frequency || '',
      startDate: prescription.start_timestamp ? new Date(prescription.start_timestamp) : undefined,
      endDate: prescription.end_timestamp ? new Date(prescription.end_timestamp) : undefined,
    }
  }

  // Start polling for prescription assistance, state, and prescriptions

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-[90vw] max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col h-full">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogHeader>
              <div>
                <DialogTitle>{t.title}</DialogTitle>
                <DialogDescription>{t.description} {patientName}</DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* Form Content - Scrollable middle section */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* AI Analysis Section */}
              {showAiAnalysis && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  {/* Thinking Display */}
                  {isThinking && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">AI</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-white rounded-lg p-3 border">
                          <div className="space-y-2">
                            {currentReasoning.map((step, index) => (
                              <div
                                key={index}
                                className={`text-sm text-gray-700 ${index <= reasoningIndex ? 'opacity-100' : 'opacity-50'}`}
                              >
                                • {step}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center mt-3 space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs text-blue-600">{thinkingWords[currentThinkingWordIndex]}...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final AI Analysis Result */}
                  {aiAnalysisComplete && prescriptionAssistanceContent && (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="text-xs bg-green-100 text-green-700">AI</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{prescriptionAssistanceContent}</div>
                          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-green-700 font-medium">✓ Analysis complete. Medications have been automatically populated below. You can review and modify them as needed.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Desktop headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
                <div className="col-span-3">{t.drugName}</div>
                <div className="col-span-2">{t.amount}</div>
                <div className="col-span-2">{t.frequency}</div>
                <div className="col-span-2">{t.startDate}</div>
                <div className="col-span-2">{t.endDate}</div>
                <div className="col-span-1">{t.action}</div>
              </div>

              {medications.map((medication, index) => (
                <div key={index} className="space-y-4 sm:space-y-0">
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{t.medication} {index + 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        disabled={medications.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`drug-${index}`} className="text-sm font-medium text-gray-700 mb-1 block">
                          {t.drugName}
                        </Label>
                        <Input
                          id={`drug-${index}`}
                          placeholder={t.placeholders.drug}
                          value={medication.drug_name}
                          onChange={(e) => updateMedication(index, "drug_name", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`amount-${index}`} className="text-sm font-medium text-gray-700 mb-1 block">
                            {t.amount}
                          </Label>
                          <Input
                            id={`amount-${index}`}
                            placeholder={t.placeholders.amount}
                            value={medication.amount}
                            onChange={(e) => updateMedication(index, "amount", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`frequency-${index}`} className="text-sm font-medium text-gray-700 mb-1 block">
                            {t.frequency}
                          </Label>
                          <Input
                            id={`frequency-${index}`}
                            placeholder={t.placeholders.frequency}
                            type="number"
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`start-${index}`} className="text-sm font-medium text-gray-700 mb-1 block">
                          {t.startDate}
                        </Label>
                        <DatePicker
                          date={medication.startDate}
                          onDateChange={(date) => updateMedication(index, "startDate", date)}
                          placeholder={t.placeholders.startDate}
                          showIcon={false}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`end-${index}`} className="text-sm font-medium text-gray-700 mb-1 block">
                          {t.endDate}
                        </Label>
                        <DatePicker
                          date={medication.endDate}
                          onDateChange={(date) => updateMedication(index, "endDate", date)}
                          placeholder={t.placeholders.endDate}
                          showIcon={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-3">
                      <Label htmlFor={`drug-${index}`} className="sr-only">
                        {t.drugName}
                      </Label>
                      <Input
                        id={`drug-${index}`}
                        placeholder={t.placeholders.drug}
                        value={medication.drug_name}
                        onChange={(e) => updateMedication(index, "drug_name", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`amount-${index}`} className="sr-only">
                        {t.amount}
                      </Label>
                      <Input
                        id={`amount-${index}`}
                        placeholder={t.placeholders.amount}
                        value={medication.amount}
                        onChange={(e) => updateMedication(index, "amount", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`frequency-${index}`} className="sr-only">
                        {t.frequency}
                      </Label>
                      <Input
                        id={`frequency-${index}`}
                        placeholder={t.placeholders.frequency}
                        type="number"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`start-${index}`} className="sr-only">
                        {t.startDate}
                      </Label>
                      <DatePicker
                        date={medication.startDate}
                        onDateChange={(date) => updateMedication(index, "startDate", date)}
                        placeholder={t.placeholders.startDate}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`end-${index}`} className="sr-only">
                        {t.endDate}
                      </Label>
                      <DatePicker
                        date={medication.endDate}
                        onDateChange={(date) => updateMedication(index, "endDate", date)}
                        placeholder={t.placeholders.endDate}
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        disabled={medications.length === 1}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addMedication} className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                {t.addAnother}
              </Button>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 p-6 pt-4 border-t">
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                {t.cancel}
              </Button>
              <Button
                onClick={handleSend}
                disabled={!medications.some((med) => med.drug_name.trim() && med.amount.trim() && med.frequency.trim() && med.startDate && med.endDate)}
                className="w-full sm:w-auto"
              >
                {t.sendPrescription}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
