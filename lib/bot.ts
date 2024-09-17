import { db, openai } from './services'
import { run } from './scheduling-assistant'
import { Bot } from "grammy";

export const bot = new Bot("7287710734:AAGmi7R4Tro8apZ2PW-b7DBFbm9eZh6Rs2c")

async function currentState() {
  const users = await db.user.findMany()
  const roster = users.map(u => u.scheduled ? `${u.firstName} ${u.lastName} - ${u.scheduled}` : `${u.firstName} ${u.lastName} is not scheduled, but available ${u.availability}`).join('\n')
  return users.length > 0 ? `The following friends have reported their availabilities, and some have been scheduled:\n\n${roster}` : `No friends have reported their availabilities yet.`
}

bot.on('message', async (ctx) => {
  // const { message, senderChat, text, chat, chatMember } = ctx
  const { message } = ctx
  let user = await db.user.findUnique({ where: { telegramId: message.from.id } })
  if (!user) {
    const thread = await openai.beta.threads.create()
    user = await db.user.create({
      data: {
        firstName: message.from.first_name,
        lastName: message.from.last_name,
        username: message.from.username,
        telegramId: message.from.id,
        threadId: thread.id,
      }
    })
  }

  await ctx.replyWithChatAction('typing')

  let result = await run(user, {
    additional_instructions:
      `You are speaking to ${message.from.first_name} ${message.from.last_name} (${message.from.username})\n\n${currentState()}`,
    additional_messages: [{ role: "user", content: message.text }],
  })

  if (result.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(user.threadId, { run_id: result.id })
    const lastMessage = messages.data[messages.data.length - 1]
    await ctx.reply(lastMessage.content.filter(c => c.type === 'text').map(c => c.text.value).join(' '))
  }
})