import { validate, parse } from '@telegram-apps/init-data-node'

export const verifyWebAppData = (req, res, next) => {
  try {
    const { initData } = req.body
    const BOT_TOKEN = process.env.BOT_TOKEN

    validate(initData, BOT_TOKEN, {expiresIn: 0}) //86400 = 24 soat

    // const parsedData = parse(initData)
    // req.telegramUser = parsedData.user
    next()


  } catch (error) {
    return res.status(401).json({success: false, message: "Xavfsizlik tekshiruvidan o'tmadi: "})
  }
}