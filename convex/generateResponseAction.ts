import { action, query } from "@/convex/_generated/server";
import { v } from "convex/values";
import { api } from "@/convex/_generated/api";
import { ConsultationState } from "@/convex/schema";
import { ConsultationState as TypesConsultationState } from "./types";
import { formatConversationHistory, translatedToLanguage } from "./utilities";
import { GeneratedMessage, QueryGeneration } from "./llm_outputs";
import { GENERATE_MESSAGE_PROMPT, GENERATE_QUERY_PROMPT } from "./prompts";
import { ConvexTypeGuards } from "@/lib/convex-services";
import Firecrawl from '@mendable/firecrawl-js';
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-2024-08-06",
  apiKey: process.env.OPENAI_API_KEY
});

export const generateResponseAction = action({
  args: {
    consultationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const clerkSenderId = process.env.CLERK_SENDER_ID;
      if (!clerkSenderId) throw Error("Clerk Sender Id missing in environment variables");
      const convexClerkId = ConvexTypeGuards.toUserId(clerkSenderId)
      const convextConsultationId = ConvexTypeGuards.toConsultationId(args.consultationId)

      const nextMessageToAppendData = {
        senderId: convexClerkId,
        consultationId: convextConsultationId,
        originalContent: "",
        originalLanguage: "",
        translatedContent: "",
        translatedLanguage: "",
        llm_content: "",
        llm_language: "en",
        state: "Determining required medical specialty"
      };

      const nextMessageToAppend = await ctx.runMutation(api.messages.sendMessage, nextMessageToAppendData);

      console.log("Generating Medical Query");

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Generating Medical Query`
      });


      let consultation = await ctx.runQuery(api.consultations.getConsultation, {
        consultationId: ConvexTypeGuards.toConsultationId(args.consultationId)
      });
      if (!consultation) throw Error("Consultation is null")

      let conversation = await ctx.runQuery(api.messages.getMessagesByConsultation, {
        consultationId: ConvexTypeGuards.toConsultationId(args.consultationId)
      })



      const userMessages = conversation.filter((el) => el.sender_id == consultation.patient_id)
      if (userMessages.length == 0) {
        throw Error("No user message found")
      }
      const lastUserMessage = userMessages[userMessages.length - 1]

      if (!lastUserMessage) {
        throw Error("No user message found")
      }

      if (!lastUserMessage.original_content) {
        throw Error("Last user message has no content")
      }
      // Map Convex message format to expected Message format

      const conversationHistory = formatConversationHistory(conversation, consultation);

      const adaptedGenerateQueryPrompt = GENERATE_QUERY_PROMPT.replace("[Last Question here]", lastUserMessage.original_content).replace("[Full Conversation here]", conversationHistory)
      const queryReponse = await llm.withStructuredOutput(QueryGeneration)
        .invoke([{ role: "user", content: adaptedGenerateQueryPrompt }]);

      console.log("Generated Query: ", queryReponse.query)

      const queryToUse = queryReponse.query
      if (!queryToUse) throw Error("Query to use undefined")

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Retrieving information from FireCrawl`
      });

      const contextRetrieved = await retrieveDataFromFireCrawl(queryToUse)

      console.log("Information retrieved")
      console.log("Generating Response")

      console.log("Retrieved Response: ", contextRetrieved)

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Generating Response`
      });

      const adaptedGenerateReplyPrompt = GENERATE_MESSAGE_PROMPT.replace("[Conversation so far]", conversationHistory).replace("[Findings from research]", contextRetrieved)

      console.log("Prompt: ", adaptedGenerateReplyPrompt)

      const replyResponse = await llm.withStructuredOutput(GeneratedMessage)
        .invoke([{ role: "user", content: adaptedGenerateReplyPrompt }]);


      console.log("Response: ", replyResponse.message_content)


      const patient = await ctx.runQuery(api.users.getUserById, { userId: consultation.patient_id });


      let translatedContent
      if (patient?.language! != "en") {
        translatedContent = await translatedToLanguage(replyResponse.message_content, patient?.language!)
      } else {
        translatedContent = replyResponse.message_content
      }


      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Message Generated`,
        originalContent: replyResponse.message_content,
        translatedContent: translatedContent,
        llm_content: replyResponse.message_content,
        originalLanguage: "en",
        translatedLanguage: patient?.language,
        llm_language: "en",
      });
    }
    catch (error) {
      console.error("Error: ", (error as Error).message);
      throw error;
    }
  }
});

async function retrieveDataFromFireCrawl(query: string) {
  const response = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
    },
    body: JSON.stringify({
      query,
      categories: ['research'],
      limit: 2
    })
  });

  const data = await response.json();

  if (data.success && data.data?.web?.length > 0) {
    return data.data.web.map((result: any) =>
      `**${result.title}**\n${result.description}\nURL: ${result.url}`
    ).join('\n\n');
  }

  return "No relevant information found.";
}
