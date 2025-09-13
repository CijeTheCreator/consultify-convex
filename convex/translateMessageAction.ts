import { action } from "@/convex/_generated/server";
import { v } from "convex/values";
import { api } from "@/convex/_generated/api";
import { ConsultationState } from "@/convex/schema";
import { TRANSLATION_PROMPT } from "./prompts";
import { TranslatedMessage } from "./llm_outputs";
import { ConvexTypeGuards } from "@/lib/convex-services";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-2024-08-06",
  apiKey: process.env.OPENAI_API_KEY
});

export const translateMessageAction = action({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    try {

      const convexMessageId = ConvexTypeGuards.toMessageId(args.messageId)
      await ctx.runMutation(api.messages.updateMessage, {
        messageId: convexMessageId,
        state: `Translating`
      });

      let translatedLanguage = "en"
      let llmLanguage = "en"


      const message = await ctx.runQuery(api.messages.getMessageById, {
        messageId: convexMessageId
      })

      if (!message) throw Error("Message does not exist")

      const consultationId = message.consultation_id

      let consultation = await ctx.runQuery(api.consultations.getConsultation, {
        consultationId
      });
      if (!consultation) throw Error("Consultation does not exist")

      console.log("Gotten Message And Consultation")
      const patient = await ctx.runQuery(api.users.getUserById, { userId: consultation?.patient_id });
      const doctor = consultation.doctor_id ? await ctx.runQuery(api.users.getUserById, { userId: consultation.doctor_id }) : null;

      if (!patient) throw Error("Patient does not exist")
      if (!doctor) throw Error("Doctor does not exist")

      if (message.sender_id === consultation.doctor_id) {
        // Doctor sent the message, so translate to patient's language
        translatedLanguage = patient.language || "en";
      } else if (message.sender_id === consultation.patient_id) {
        // Patient sent the message, so translate to doctor's language
        translatedLanguage = doctor.language || "en";
      }

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: convexMessageId,
        state: `Translating to ${translatedLanguage}`
      });

      let translatedContent
      let llmContent
      if (translatedLanguage == llmLanguage) {
        translatedContent = await translatedToLanguage(message.original_content, translatedLanguage)
        llmContent = translatedContent
      } else {
        translatedContent = await translatedToLanguage(message.original_content, translatedLanguage)
        llmLanguage = await translatedToLanguage(message.original_content, llmLanguage)
      }
      console.log("Translated Content: ", translatedContent)

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: convexMessageId,
        state: `Translated to ${translatedLanguage}`,
        translatedContent: translatedContent,
        translatedLanguage: translatedLanguage,
        llm_content: llmContent,
        llm_language: llmLanguage
      });
    }
    catch (error) {
      console.log("Error: ", (error as Error).message);
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
