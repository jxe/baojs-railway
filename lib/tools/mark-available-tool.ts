import { z } from "zod";
import { type Tool } from '../openai'
import { User } from "@prisma/client";
import { db } from "../services";

const markAvailableSchema = z.object({
  availability: z.string(),
})

export const markAvailableTool = {
  schema: markAvailableSchema,
  async fn({ availability }, { user }) {
    await db.user.update({
      where: { id: user.id },
      data: { availability }
    })

    return `User has been updated.`
  }
} satisfies Tool<z.infer<typeof markAvailableSchema>, { user: User }>
