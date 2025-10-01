import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMessageById = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    
    if (!message) {
      return null;
    }

    // Transform to match the existing Message interface
    return {
      id: message._id,
      sender_id: message.senderId,
      consultation_id: message.consultationId,
      original_content: message.originalContent,
      original_language: message.originalLanguage,
      translated_content: message.translatedContent,
      translated_language: message.translatedLanguage,
      llm_content: message.llm_content,
      llm_language: message.llm_language,
      state: message.state,
      created_at: new Date(message.createdAt).toISOString(),
      updated_at: new Date(message.updatedAt).toISOString(),
    };
  },
});

export const getMessagesByConsultation = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .order("asc")
      .collect();

    // Transform to match the existing Message interface
    return messages.map((message) => ({
      id: message._id,
      sender_id: message.senderId,
      consultation_id: message.consultationId,
      original_content: message.originalContent,
      original_language: message.originalLanguage,
      translated_content: message.translatedContent,
      translated_language: message.translatedLanguage,
      llm_content: message.llm_content,
      llm_language: message.llm_language,
      state: message.state,
      created_at: new Date(message.createdAt).toISOString(),
      updated_at: new Date(message.updatedAt).toISOString(),
    }));
  },
});

export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    consultationId: v.id("consultations"),
    originalContent: v.string(),
    originalLanguage: v.string(),
    translatedContent: v.optional(v.string()),
    translatedLanguage: v.optional(v.string()),
    llm_content: v.string(),
    llm_language: v.string(),
    state: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      consultationId: args.consultationId,
      originalContent: args.originalContent,
      originalLanguage: args.originalLanguage,
      translatedContent: args.translatedContent || "",
      translatedLanguage: args.translatedLanguage || "",
      llm_content: args.llm_content,
      llm_language: args.llm_language,
      state: args.state || "completed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return the created message with the same structure as the API
    return {
      id: messageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.optional(v.id("users")),
    consultationId: v.optional(v.id("consultations")),
    originalContent: v.optional(v.string()),
    originalLanguage: v.optional(v.string()),
    translatedContent: v.optional(v.string()),
    translatedLanguage: v.optional(v.string()),
    llm_content: v.optional(v.string()),
    llm_language: v.optional(v.string()),
    state: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updatedAt: Date.now(),
    };

    // Only update fields that are provided
    if (args.senderId !== undefined) updateData.senderId = args.senderId;
    if (args.consultationId !== undefined) updateData.consultationId = args.consultationId;
    if (args.originalContent !== undefined) updateData.originalContent = args.originalContent;
    if (args.originalLanguage !== undefined) updateData.originalLanguage = args.originalLanguage;
    if (args.translatedContent !== undefined) updateData.translatedContent = args.translatedContent;
    if (args.translatedLanguage !== undefined) updateData.translatedLanguage = args.translatedLanguage;
    if (args.llm_content !== undefined) updateData.llm_content = args.llm_content;
    if (args.llm_language !== undefined) updateData.llm_language = args.llm_language;
    if (args.state !== undefined) updateData.state = args.state;

    await ctx.db.patch(args.messageId, updateData);

    return args.messageId;
  },
});

export const updateMessageState = mutation({
  args: {
    messageId: v.id("messages"),
    state: v.string(),
    translatedContent: v.optional(v.string()),
    translatedLanguage: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      state: args.state,
      updatedAt: Date.now(),
    };

    if (args.translatedContent) {
      updateData.translatedContent = args.translatedContent;
    }

    if (args.translatedLanguage) {
      updateData.translatedLanguage = args.translatedLanguage;
    }

    await ctx.db.patch(args.messageId, updateData);

    return args.messageId;
  },
});