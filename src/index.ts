import { bot } from '../lib/bot'
import type { Update } from "grammy/types"

console.log(`Server listening!`)
await bot.init()

Bun.serve({
  port: parseInt(process.env.PORT || "8080"),
  // error: (err) => console.error(err),
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("Hello world!");
    if (url.pathname === "/install-webhook" && req.method === "GET") {
      await bot.api.setWebhook(`${process.env.RAILWAY_PUBLIC_DOMAIN}/api/bot`);
      return new Response("Webhook installed");
    }
    if (url.pathname === "/api/bot" && req.method === "POST") {
      const json = (await req.json()) as { update: Update }
      const update = json.update as Update
      console.log('update', JSON.stringify(update));
      let replied;
      await bot.handleUpdate(update, {
        send(payload) {
          replied = payload;
        }
      });
      return new Response(JSON.stringify(replied || {}), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Not found", { status: 404 });
  }
})


// const cb = webhookCallback(bot, (ctx: Context) => ({
//   update: ctx.req.json() as Promise<Update>,
//   respond: (json: any) => ctx.sendJson(json),
//   unauthorized: () => ctx.sendEmpty({ status: 401 }),
// }))


