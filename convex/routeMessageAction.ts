import { action } from "@/convex/_generated/server";
import { v } from "convex/values";
import { api } from "@/convex/_generated/api";
import { ConsultationState } from "@/convex/schema";
import { ConsultationState as TypesConsultationState } from "./types";
import { ConvexTypeGuards } from "@/lib/convex-services";
import { DOCTOR_SELECTION_PROMPT, TRANSLATION_PROMPT } from "./prompts";
import { DoctorSelection, TranslatedMessage } from "./llm_outputs";
import { formatConversationHistory } from "./utilities";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-2024-08-06",
  apiKey: process.env.OPENAI_API_KEY
});

export const routeMessageAction = action({
  args: {
    consultationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {

      let consultation = await ctx.runQuery(api.consultations.getConsultation, {
        consultationId: ConvexTypeGuards.toConsultationId(args.consultationId)
      });
      if (!consultation) throw Error("Consultation is null")
      if (consultation.state == "CONSULTING") {
        return "Translate"
      }

      let conversation = await ctx.runQuery(api.messages.getMessagesByConsultation, {
        consultationId: ConvexTypeGuards.toConsultationId(args.consultationId)
      })


      const mappedConversation = conversation.map(msg => ({
        id: msg.id,
        translated_content: msg.translated_content,
        translated_language: msg.translated_language,
        original_language: msg.original_language,
        original_content: msg.original_content,
        llm_language: msg.llm_language,
        llm_content: msg.llm_content,
        state: msg.state,
        sender_id: msg.sender_id,
        consultation_id: msg.consultation_id,
        created_at: new Date(msg.created_at),
        updated_at: new Date(msg.updated_at)
      }));

      // Map consultation format
      const mappedConsultation = {
        id: consultation.id,
        state: consultation.state as TypesConsultationState,
        prescription_assistance: consultation.prescriptionAssistance,
        prescription_assistance_state: consultation.prescriptionAssistanceState,
        patient_id: consultation.patient_id,
        doctor_id: consultation.doctor_id,
        created_at: new Date(consultation.createdAt),
        updated_at: new Date(consultation.updatedAt)
      };

      const conversationHistory = formatConversationHistory(mappedConversation, mappedConsultation);
      const adaptedDoctorSelectionPrompt = DOCTOR_SELECTION_PROMPT.replace("{conversation}", conversationHistory)

      const doctorSelectionResponse = await llm.withStructuredOutput(DoctorSelection)
        .invoke([{ role: "user", content: adaptedDoctorSelectionPrompt }]);

      if (doctorSelectionResponse.binary_score == "YES") {
        return "Select Doctor"
      }
      return "Generate Response"

    }
    catch (error) {
      console.error("Error: ", (error as Error).message);
      throw error;
    }
  }
});

export async function translatedToLanguage(originalContent: string | undefined, translatedLanguage: string) {
  const adaptedTranslationPrompt = TRANSLATION_PROMPT.replace("[TARGET_LANGUAGE]", translatedLanguage).replace("[MESSAGE_CONTENT]", originalContent!)

  const translationResponse = await llm.withStructuredOutput(TranslatedMessage)
    .invoke([{ role: "user", content: adaptedTranslationPrompt }]);
  return translationResponse.translated_content
}
