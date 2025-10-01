import { Consultation, Message } from "./types";

export function formatConversationHistory(conversation: Message[], consultation: any): string {
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
