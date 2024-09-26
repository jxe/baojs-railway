import { z } from "zod";
import { type Tool } from '../openai'
import { User } from "@prisma/client";
import { db } from "../services";
import { bot } from '../bot'

const assignBuddySchema = z.object({
  buddyId: z.number().describe('The user ID of the person your conversation partner will walk with.'),
  scheduleForConversationPartner: z.string().describe('A description of your conversation partner\'s schedule, as you\'ve scheduled it.'),
  scheduleForBuddy: z.string().describe('A description of how you scheduled their buddy.'),
  messageForBuddy: z.string().describe('A message to send to the buddy, telling them when and where to meet Joe and your conversation partner, and whether they will walk with Joe before or after. This note should be polite, start with a greeting, and ask them if the match is okay with them.'),
})

export const assignBuddyTool = {
  schema: assignBuddySchema,
  async fn({ buddyId, scheduleForBuddy, scheduleForConversationPartner, messageForBuddy }, { user }) {
    await db.user.update({
      where: { id: user.id },
      data: {
        walkingWithUserId: buddyId,
        scheduled: scheduleForConversationPartner,
      }
    })

    const buddy = await db.user.update({
      where: { id: buddyId },
      data: {
        walkingWithUserId: user.id,
        scheduled: scheduleForBuddy,
      }
    })

    await bot.api.sendMessage(buddy.telegramId, `${messageForBuddy}. \n\n(You have been matched with ${user.firstName} ${user.lastName} to go for a walk. Their telegram username is @${user.username}.`)

    return `Plan is set.`
  }
} satisfies Tool<z.infer<typeof assignBuddySchema>, { user: User }>
