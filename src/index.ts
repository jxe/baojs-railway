import Bao from "baojs";
import { bot } from '../lib/bot'
import { Update } from "grammy/types";

const app = new Bao()
const port = parseInt(process.env.PORT || "8080")

app.get("/", (ctx) => {
  return ctx.sendText("Hello world from Bao.js running on Railway!")
})

app.get('/install-webhook', async (ctx) => {
  await bot.api.setWebhook(`${process.env.RAILWAY_PUBLIC_DOMAIN}/api/bot`)
  return ctx.sendText('Webhook installed')
})

// const cb = webhookCallback(bot, (ctx: Context) => ({
//   update: ctx.req.json() as Promise<Update>,
//   respond: (json: any) => ctx.sendJson(json),
//   unauthorized: () => ctx.sendEmpty({ status: 401 }),
// }))

app.post('/api/bot', async (ctx) => {
  const update = await ctx.req.json() as Update
  let replied
  await bot.handleUpdate(update, {
    send(payload) {
      replied = payload
    }
  })
  if (replied) return ctx.sendJson(replied)
  return ctx.sendEmpty()
})

const server = app.listen({ port: port });
console.log(`Server listening on ${server.hostname}:${port}`);
