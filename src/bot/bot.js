import { Bot, InlineKeyboard } from 'grammy'
import dotenv from 'dotenv/config'

import { findOrCreateUser, getUserSessions } from '../service/bot.service.js'

const bot = new Bot (process.env.BOT_TOKEN)
const url = 'https://userbot-front-msax4hlxi-qodirovabdulazizjongmailcoms-projects.vercel.app/'

bot.chatType('private').command('start', async(ctx) => {
  await findOrCreateUser(ctx.from)


  ctx.reply(`Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nIlovadan foydalanish uchun pastdagi tugmani bosing:`, {
    reply_markup: {inline_keyboard:[
      [
        {text: 'Boshlash', web_app: {url: url}, icon_custom_emoji_id: '5276355705249474469'}
      ]
    ]}
  })
})





export default bot