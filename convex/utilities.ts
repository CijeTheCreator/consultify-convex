import { TranslatedMessage } from "./llm_outputs";
import { Message } from "./types";
import { Consultation } from "@/lib/types";
import { TRANSLATION_PROMPT } from "./prompts";
import { ChatOpenAI } from "@langchain/openai";

export function formatConversationHistory(conversation: any[], consultation: any): string {
  const formattedMessages: string[] = [];

  for (const message of conversation) {
    let role = "unknown";
    if (message.sender_id === consultation.patient_id) {
      role = "patient";
    } else if (message.sender_id === consultation.clerk_id) {
      role = "clerk";
    } else if (message.sender_id === consultation.doctor_id) {
      role = "doctor";
    }

    const content = message.original_content || message.llm_content;
    formattedMessages.push(`${role}: ${content}`);
  }

  return formattedMessages.join("\n");
}

export async function translatedToLanguage(originalContent: string | undefined, translatedLanguage: string) {
  const adaptedTranslationPrompt = TRANSLATION_PROMPT.replace("[TARGET_LANGUAGE]", translatedLanguage).replace("[MESSAGE_CONTENT]", originalContent!)

  const llm = new ChatOpenAI({
    model: "gpt-4o-2024-08-06",
    apiKey: process.env.OPENAI_API_KEY
  });


  const translationResponse = await llm.withStructuredOutput(TranslatedMessage)
    .invoke([{ role: "user", content: adaptedTranslationPrompt }]);
  return translationResponse.translated_content
}

