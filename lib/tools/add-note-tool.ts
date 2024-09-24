import { z } from "zod";
import { type Tool } from '../openai'
import { User } from "@prisma/client";
import { db } from "../services";

const addNoteSchema = z.object({
  note: z.string(),
})

export const addNoteTool = {
  schema: addNoteSchema,
  async fn({ note }, { user }) {
    await db.notes.create({
      data: {
        text: note,
        userId: user.id
      }
    })

    return `Note added.`
  }
} satisfies Tool<z.infer<typeof addNoteSchema>, { user: User }>
