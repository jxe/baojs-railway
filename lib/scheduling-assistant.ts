import { type User } from '@prisma/client'
import { createRunAndPollAndHandleToolCalls, type Assistant, type RunParams, type Tool } from './openai'
import { z } from 'zod'
import { db } from './services'

const scheduleSchema = z.object({
  availability: z.string(),
  scheduled: z.string().optional(),
  buddiedWith: z.number().optional()
})

export const schedulingAssistant = {
  id: "asst_A4tDnaSW9oTrB9ikSSSTqIpM",
  tools: {
    scheduleTool: {
      schema: scheduleSchema,
      async fn({ availability, buddiedWith, scheduled }, { user }) {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            availability, scheduled, walkingWithUserId: buddiedWith
          }
        })
        return `Updated the schedule.`
      }
    } satisfies Tool<z.infer<typeof scheduleSchema>, { user: User }>
  }
} satisfies Assistant<{ user: User }>

export async function run(user: User, params: RunParams) {
  return await createRunAndPollAndHandleToolCalls(schedulingAssistant, user.threadId, params, { user })
}
