import { nextJsHandler } from "@convex-dev/better-auth/nextjs";
import { createAuth } from "@/convex/auth";

export const { GET, POST } = nextJsHandler(createAuth);