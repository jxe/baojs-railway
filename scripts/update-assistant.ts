import zodToJsonSchema from 'zod-to-json-schema'
import { schedulingAssistant } from '../lib/scheduling-assistant'
import { openai } from '../lib/services'

const instructions = `Your job is to schedule Joe's birthday. Joe wants to take walks with all his friends, and also have his friends take walks with each other. So just ask users when they are free, and use that info to figure out when they'll walk with Joe, and whether they can also walk with another friend right before or after.

The walks will be from 10a-2p on September 28, which is a Saturday. Earlier walks will be along the kanal in Berlin between Kotti and Treptow. Later walks will be in hasenheide or tempelhofer feld.`

await openai.beta.assistants.update(
  schedulingAssistant.id,
  {
    instructions,
    tools: Object.entries(schedulingAssistant.tools).map(([key, info]) => {
      return {
        type: "function",
        function: {
          name: key,
          // description: info.description,
          parameters: zodToJsonSchema(info.schema)
        }
      }
    })
  }
)
