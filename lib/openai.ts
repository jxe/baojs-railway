import { OpenAI } from 'openai'
import { z } from 'zod'
import type { Run } from 'openai/resources/beta/threads/index.mjs'
import { openai } from './services'

export interface Assistant<C> {
  id: string,
  tools: Record<string, Tool<any, C>>
}

export interface Tool<T, C> {
  schema: z.ZodType<T>
  description?: string
  fn: (params: T, context: C) => Promise<string>
}

// export interface Tool<T, C> {
//   schema: z.ZodType<T>,
//   description?: string
//   fn: (params: T, context: C) => Promise<string>
// }

async function toolOutputs<C>(run: Run, tools: Record<string, Tool<any, any>>, context: C) {
  if (!run.required_action || run.required_action.type !== 'submit_tool_outputs')
    return []
  return await Promise.all(
    run.required_action.submit_tool_outputs.tool_calls.map(
      async (toolCall: any) => {
        const fn = toolCall.function.name
        const parameters = JSON.parse(toolCall.function.arguments)
        console.log('calling tool', fn, parameters)
        try {
          const output = await tools[fn].fn(parameters, context)
          console.log('got output', output)
          return {
            tool_call_id: toolCall.id,
            output: JSON.stringify(output),
          }
        } catch (e) {
          console.error('error running tool', fn, e)
          return {
            tool_call_id: toolCall.id,
            output: JSON.stringify({
              error: (e as any).message,
            }),
          }
        }
      }
    )
  )
}

export type RunParams = Omit<OpenAI.Beta.Threads.Runs.RunCreateParamsNonStreaming, 'assistant_id'>

export async function createRunAndPollAndHandleToolCalls<C>(assistant: Assistant<C>, threadId: string, params: RunParams, context: C) {
  let run = await openai.beta.threads.runs.createAndPoll(threadId, {
    ...params,
    assistant_id: assistant.id
  })
  while (
    run.status === 'requires_action' &&
    run.required_action?.type === 'submit_tool_outputs'
  ) {
    const tool_outputs = await toolOutputs<C>(run, assistant.tools, context)
    run = await openai.beta.threads.runs.submitToolOutputsAndPoll(threadId, run.id, { tool_outputs })
  }
  return run
}
