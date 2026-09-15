import app from "./src/app.js"
import bot from "./src/bot/bot.js"
import db from "./src/models/index.js"
import chalk from "chalk"
import dotenv from "dotenv"

dotenv.config({ quiet: true })

const PORT = process.env.PORT || 3000
const SERVER_URL = process.env.DOMAIN // Masalan: https://domain.uz yoki ngrok HTTPS havolasi

const startServer = async () => {
  try {
    // 1. Bazaga ulanish (kerak bo'lsa izohdan ochasiz)
    await db.sequelize.authenticate()

    console.log(chalk.bgGreen(' Database connection is true '))
    await db.sequelize.sync({ alter: true })

    // 2. Express serverni ishga tushirish
    app.listen(PORT, async () => {
      console.log(chalk.green(`Server running on port: ${PORT}`))

      // 3. Webhook URL'ni Telegram API-ga sozlash
      if (SERVER_URL) {
        const webhookUrl = `${SERVER_URL}/telegram-webhook/${process.env.BOT_TOKEN}`
        await bot.api.setWebhook(webhookUrl)
        console.log(chalk.blue(`🔗 Webhook muvaffaqiyatli o'rnatildi: ${webhookUrl}`))
      } else {
        console.log(chalk.yellow(`⚠️ SERVER_URL topilmadi! Webhook o'rnatilmadi.`))
      }
    })

  } catch (error) {
    console.log(chalk.red(`Dasturni ishga tushirishda xatolik: `) + error.message)
  }
}

startServer()