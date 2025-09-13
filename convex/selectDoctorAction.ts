import { action } from "@/convex/_generated/server";
import { v } from "convex/values";
import { api } from "@/convex/_generated/api"
import { Consultation as TypesConsultationState } from "./types";
import { formatConversationHistory } from "../lib/utilities";
import { SELECT_SPECIALIST_PROMPT, SELECTION_RATIONALE_PROMPT } from "../lib/prompts";
import { ChatMistralAI } from "@langchain/mistralai";
import { DoctorSelectionRationale, MedicalSpecialtyResponse } from "./llm_outputs";
import { ConvexTypeGuards } from "@/lib/convex-services";
import { translatedToLanguage } from "./translateMessageAction";

const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY
});

export const selectDoctorAction = action({
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

      // Call mutation from action using ctx.runMutation
      const nextMessageToAppend = await ctx.runMutation(api.messages.sendMessage, nextMessageToAppendData);


      let consultation = await ctx.runQuery(api.consultations.getConsultation, {
        consultationId: ConvexTypeGuards.toConsultationId(args.consultationId)
      });

      if (!consultation) throw Error("Consultation is null")

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

      const conversationHistory = formatConversationHistory(mappedConversation, consultation);
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

      const patient = await ctx.runQuery(api.users.getUserById, { userId: consultation.patient_id });


      let translatedContent
      if (patient?.language! != "en") {
        translatedContent = await translatedToLanguage(rationaleResponse.rationale, patient?.language!)
      } else {
        translatedContent = rationaleResponse.rationale
      }

      await ctx.runMutation(api.messages.updateMessage, {
        messageId: nextMessageToAppend.id,
        state: `Doctor selection rationale created`,
        originalContent: rationaleResponse.rationale,
        originalLanguage: "en",
        translatedLanguage: patient?.language, //TODO: Handle this later
        llm_language: "en",
        translatedContent: translatedContent,
        llm_content: rationaleResponse.rationale,
      });


    }
    catch (error) {
      console.error("Error: ", (error as Error).message);
      throw error;
    }
  }
});
