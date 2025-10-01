import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  AgentState,
  Message,
  Doctor,
  Consultation
} from "./types";

// Hook to get doctors by specialty
function useDoctorsBySpecialty(specialty?: string) {
  return useQuery(api.users.getDoctorsBySpecialty, { specialty: specialty || "General Medicine" });
}

// Hook to assign doctor to consultation
function useAssignDoctor() {
  return useMutation(api.consultations.updateConsultationState);
}

// Hook to get user by ID
function useUser(userId: string) {
  return useQuery(api.users.getUserById, { userId: userId as Id<"users"> });
}

// Export hooks for use in React components
export { useDoctorsBySpecialty, useAssignDoctor, useUser };

// Main clerking function - calls server-side API route
export async function processClerkingMessage(
  agentState: AgentState,
  createMessage: (params: any) => Promise<any>,
  updateMessage: (params: any) => Promise<any>,
  clerkSenderId?: string
): Promise<AgentState> {
  try {
    const actualClerkSenderId = clerkSenderId || DEFAULT_CLERK_SENDER_ID;

    // Create a placeholder message to show processing
    const routingMessage = await createMessage({
      senderId: actualClerkSenderId,
      consultationId: agentState.consultation!.id,
      originalContent: "",
      originalLanguage: "en",
      translatedContent: "",
      translatedLanguage: "",
      llmContent: "",
      llmLanguage: "en",
      state: "Processing your message..."
    });

    // Call the server-side API route for routing decision
    const routeResponse = await fetch('/api/clerking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'route',
        agentState
      })
    });

    if (!routeResponse.ok) {
      throw new Error('Failed to route message');
    }

    const { route } = await routeResponse.json();

    // Update the message with the route information
    await updateMessage({
      messageId: routingMessage.id,
      state: `Routing to: ${route}`
    });

    // For now, just update with a simple response
    // TODO: Implement full clerking logic in the API route
    const responseContent = `Thank you for your message. I'm processing your request through the ${route} pathway. This is a placeholder response while the full implementation is being developed.`;

    await updateMessage({
      messageId: routingMessage.id,
      originalContent: responseContent,
      originalLanguage: "en",
      translatedContent: responseContent,
      translatedLanguage: "en",
      llmContent: responseContent,
      llmLanguage: "en",
      state: "completed"
    });

    return agentState;
  } catch (error) {
    console.error('Error in processClerkingMessage:', error);
    throw error;
  }
}
