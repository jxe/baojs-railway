import { type User } from '@prisma/client'
import { createRunAndPollAndHandleToolCalls, type Assistant, type RunParams } from './openai'
import { addNoteTool } from './tools/add-note-tool'
import { markAvailableTool } from './tools/mark-available-tool'
import { assignBuddyTool } from './tools/assign-buddy-tool'

export const schedulingAssistant = {
  id: "asst_88Axg4RFfNYaYvyGIxQqhXR2",
  tools: {
    addNoteTool,
    markAvailableTool,
    assignBuddyTool,
  }
} satisfies Assistant<{ user: User }>

export async function run(user: User, params: RunParams) {
  return await createRunAndPollAndHandleToolCalls(schedulingAssistant, user.threadId, params, { user })
}
