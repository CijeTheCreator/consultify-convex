import type { Id } from "@/convex/_generated/dataModel"

// Helper functions to convert between string IDs and Convex IDs
export class ConvexIdService {
  static toConvexId<T extends keyof Record<string, any>>(id: string, table: T): Id<T> {
    return id as Id<T>
  }

  static fromConvexId(id: Id<any>): string {
    return id as string
  }

  static isValidConvexId(id: string): boolean {
    // Basic validation for Convex ID format
    return typeof id === 'string' && id.length > 0
  }
}

// Type guards for consultation and user types
export class ConvexTypeGuards {
  static isConsultationId(id: string): id is Id<"consultations"> {
    return ConvexIdService.isValidConvexId(id)
  }


  static isMessageId(id: string): id is Id<"messages"> {
    return ConvexIdService.isValidConvexId(id)
  }

  static isUserId(id: string): id is Id<"users"> {
    return ConvexIdService.isValidConvexId(id)
  }

  static toConsultationId(id: string): Id<"consultations"> {
    if (!this.isConsultationId(id)) {
      throw new Error(`Invalid consultation ID: ${id}`)
    }
    return id
  }

  static toUserId(id: string): Id<"users"> {
    if (!this.isUserId(id)) {
      throw new Error(`Invalid user ID: ${id}`)
    }
    return id
  }


  static toMessageId(id: string): Id<"messages"> {
    if (!this.isMessageId(id)) {
      throw new Error(`Invalid message ID: ${id}`)
    }
    return id
  }

}
