import { z } from "zod";
import { type Tool } from '../openai'
import { User } from "@prisma/client";
import { db } from "../services";
import { bot } from '../bot'

const assignBuddySchema = z.object({
  buddyId: z.number().describe('The user ID of the person this user is walking with. This will inform the other user they\'ve been matched.'),
  messageForBuddy: z.string().describe('A message to send to the buddy this user has been matched with, telling them when and where to meet, and whether they will walk with Joe before or after.'),
  plan: z.string().describe('The plan for the walk'),
})

export const assignBuddyTool = {
  schema: assignBuddySchema,
  async fn({ buddyId, messageForBuddy, plan }, { user }) {
    await db.user.update({
      where: { id: user.id },
      data: {
        walkingWithUserId: buddyId,
        scheduled: plan,
      }
    })

    const buddy = await db.user.findUniqueOrThrow({ where: { id: buddyId } })
    await bot.api.sendMessage(buddy.telegramId, `${messageForBuddy}. \n\n(You have been matched with ${user.firstName} ${user.lastName} to go for a walk. Their telegram username is @${user.username}.`)
    return `Plan is set.`
  }
} satisfies Tool<z.infer<typeof assignBuddySchema>, { user: User }>
