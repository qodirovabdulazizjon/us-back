import express from 'express'
import bot from './bot/bot.js'
import { webhookCallback } from "grammy"
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const app = express()

// 1. Birinchi bo'lib kelayotgan JSON so'rovlarni pars qilish kerak
app.use(express.json())

// 2. Marshrutlar (Routes)
import authRoute from './routes/auth.routes.js'
import mainRoute from './routes/main.routes.js'

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/', mainRoute)

// 3. Webhook callback (Endi req.body mavjud bo'ladi)
const webhookPath = `/telegram-webhook/${process.env.BOT_TOKEN}`
app.use(webhookPath, webhookCallback(bot, "express"))

export default app