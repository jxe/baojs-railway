import Bao from "baojs";
import { bot } from '../lib/bot'
import { webhookCallback } from "grammy";

const app = new Bao()
const port = parseInt(process.env.PORT || "8080")

app.get("/", (ctx) => {
  return ctx.sendText("Hello world from Bao.js running on Railway!")
})

app.get('/install-webhook', async (ctx) => {
  await bot.api.setWebhook(`${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/bot`)
  return ctx.sendText('Webhook installed')
})

app.post('/api/bot', webhookCallback(bot, "callback"))

const server = app.listen({ port: port });
console.log(`Server listening on ${server.hostname}:${port}`);
