import { type User } from '@prisma/client'
import { createRunAndPollAndHandleToolCalls, type Assistant, type RunParams, type Tool } from './openai'
import { z } from 'zod'
import { db } from './services'
import { bot } from './bot'

const scheduleSchema = z.object({
  availability: z.string(),
  scheduled: z.string().optional(),
  buddiedWith: z.number().optional().describe('The user ID of the person this user is walking with. This will inform the other user they\'ve been matched.'),
  messageForBuddy: z.string().optional().describe('A message to send to the buddy this user has been matched with, telling them when and where to meet, and whether they will walk with Joe before or after.'),
})

export const schedulingAssistant = {
  id: "asst_88Axg4RFfNYaYvyGIxQqhXR2",
  tools: {
    scheduleTool: {
      schema: scheduleSchema,
      async fn({ availability, buddiedWith, scheduled, messageForBuddy }, { user }) {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            availability, scheduled, walkingWithUserId: buddiedWith
          }
        })

        if (buddiedWith) {
          const buddy = await db.user.findUnique({ where: { id: buddiedWith } })
          await bot.api.sendMessage(buddy.telegramId, `${messageForBuddy}. \n\n(You have been matched with ${user.firstName} ${user.lastName} to go for a walk. Their telegram username is @${user.username}. They are available at ${availability}.)`)
        } else {
          return `User has been updated.`
        }
      }
    } satisfies Tool<z.infer<typeof scheduleSchema>, { user: User }>
  }
} satisfies Assistant<{ user: User }>

export async function run(user: User, params: RunParams) {
  return await createRunAndPollAndHandleToolCalls(schedulingAssistant, user.threadId, params, { user })
}
