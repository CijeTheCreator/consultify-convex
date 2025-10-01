import { Consultation, MedicalSpecialty, Message } from "../lib/types";

import { action } from "@/convex/_generated/server";
import { v } from "convex/values";
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ConvexTypeGuards } from "../lib/convex-services";
import { formatConversationHistory } from "../lib/utilities";
import { SELECT_SPECIALIST_PROMPT, SELECTION_RATIONALE_PROMPT } from "../lib/prompts";
import { ChatMistralAI } from "@langchain/mistralai";
import { DoctorSelectionRationale, MedicalSpecialtyResponse } from "../lib/llm-outputs";


const sendMessageMutation = useMutation(api.messages.sendMessage)
const updateMessageMutation = useMutation(api.messages.updateMessage)


const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY
});


export const selectDoctorAction = action({
  args: {
    consultation: v.any(), // Define proper schema
    conversation: v.array(v.any()), // Define proper schema
  },
  handler: async (ctx, args) => {
    try {
      const clerkSenderId = process.env.CLERK_SENDER_ID;
      if (!clerkSenderId) throw Error("Clerk Sender Id missing in environment variables");

      const convexClerkId = clerkSenderId as any; // Use proper type conversion
      const convextConsultationId = args.consultation.id as any;

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

      // Call mutation from action using ctx.runMutation
      const nextMessageToAppend = await ctx.runMutation(api.messages.sendMessage, nextMessageToAppendData);

      const conversationHistory = formatConversationHistory(args.conversation, args.consultation);
      const adaptedSelectSpecialistPrompt = SELECT_SPECIALIST_PROMPT.replace("{Insert conversation here}", conversationHistory);

      const specialtyResponse = await llm.withStructuredOutput(MedicalSpecialtyResponse)
        .invoke([{ role: "user", content: adaptedSelectSpecialistPrompt }]);

      console.log("Selected specialty is ", specialtyResponse);

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Specialty determined: ${specialtyResponse.specialty}`
      });

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Finding doctor with specialty: ${specialtyResponse.specialty}`
      });

      let doctors = await ctx.runQuery(api.users.getDoctorsBySpecialty, {
        specialty: specialtyResponse.specialty
      });

      if (!doctors) throw Error("Error: Doctors undefined");

      if (doctors.length === 0) {
        console.log(`No doctors found for specialty '${specialtyResponse.specialty}', trying 'General Medicine'`);
        await ctx.runMutation(api.messages.updateMessage, {
          messageId: nextMessageToAppend.id,
          state: `No doctors found for specialty '${specialtyResponse.specialty}', trying 'General Medicine'`
        });
        doctors = await ctx.runQuery(api.users.getDoctorsBySpecialty, {
          specialty: "General Medicine"
        });
      }

      if (doctors.length === 0) {
        console.log(`Finding any available doctor`);
        await ctx.runMutation(api.messages.updateMessage, {
          messageId: nextMessageToAppend.id,
          state: `Finding any available doctor`
        });
        doctors = await ctx.runQuery(api.users.getAllDoctors, {});
      }

      if (doctors.length === 0) {
        console.log(`No available doctor`);
        await ctx.runMutation(api.messages.updateMessage, {
          messageId: nextMessageToAppend.id,
          state: `No available doctor found`
        });
        return { success: false, message: "No available doctor found" };
      }

      const selectedDoctor = doctors[Math.floor(Math.random() * doctors.length)];
      console.log(`Selected doctor: ${selectedDoctor.id} with specialty: ${selectedDoctor.specialty}`);

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Doctor found: ${selectedDoctor.specialty} specialist`
      });


      console.log(`Creating doctor selection rationale`);

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Creating doctor selection rationale`
      });

      const doctorInfo = `Doctor ID: ${selectedDoctor.id}, Specialty: ${specialtyResponse.specialty}, Language: ${selectedDoctor.language}`

      const adaptedSelectionRationalePrompt = SELECTION_RATIONALE_PROMPT.replace(`[Insert conversation between patient and medical clerk here]`, conversationHistory).replace(`[Insert doctor's profile, specialization, experience, and relevant details here]`, doctorInfo)


      const rationaleResponse = await llm.withStructuredOutput(DoctorSelectionRationale)
        .invoke([{ role: "user", content: adaptedSelectionRationalePrompt }]);


      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Doctor selection rationale created`
      });

      await ctx.runMutation(api.consultations.updateConsultationState, {
        consultationId: convextConsultationId,
        state: `CONSULTING`,
        doctorId: selectedDoctor.id
      });

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Doctor selection rationale created`,
        originalContent: rationaleResponse.rationale,
        originalLanguage: "en", //TODO: Handle this later
        translatedLanguage: "en", //TODO: Handle this later
        llm_language: "en", //TODO: Handle this later
        translatedContent: rationaleResponse.rationale,
        llm_content: rationaleResponse.rationale,
      });


    }
    catch (error) {
      console.error("Error: ", error.message);
      throw error;
    }
  }
});
