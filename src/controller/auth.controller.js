import { Api } from 'telegram'
import { getOrClient, clearAuthClient } from '../service/gramjs.service.js'
import db from '../models/index.js'

const cleanPhoneNumber = (phone) => String(phone).replace(/\D/g, "")

export const sendCode = async (req, res) => {
  try {
    const { userId, phone } = req.body
    if (!userId || !phone) {
      return res.status(400).json({ message: `Ma'lumot yetarli emas!` })
    }

    const formattedPhone = cleanPhoneNumber(phone)
    if (formattedPhone.length < 10) {
      return res.status(400).json({ message: `Telefon raqam formati noto'g'ri!` })
    }

    const sessionData = getOrClient(userId)
    const { client } = sessionData

    if (!client.connected) {
      await client.connect()
    }

    const { phoneCodeHash } = await client.sendCode(
      {
        apiId: Number(process.env.TELEGRAM_API_ID),
        apiHash: process.env.TELEGRAM_API_HASH,
      },
      formattedPhone
    )

    sessionData.phoneCodeHash = phoneCodeHash
    sessionData.phoneNumber = formattedPhone

    return res.status(200).json({ success: true, message: "Kod yuborildi!" })

  } catch (error) {
    console.error("sendCode Error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const verifyCode = async (req, res) => {
  try {
    const { userId, code } = req.body
    if (!userId || !code) {
      return res.status(400).json({ message: "userId va code kiritilishi shart!" })
    }

    const sessionData = getOrClient(userId)
    if (!sessionData || !sessionData.phoneCodeHash) {
      return res.status(400).json({ message: "Avval telefon raqam yuboring!" })
    }

    const { client, phoneNumber, phoneCodeHash } = sessionData

    if (!client.connected) {
      await client.connect()
    }

    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode: String(code).trim(),
      })
    )

    const stringSession = client.session.save()
    const me = await client.getMe()

    await db.session.upsert({
      user_id: userId,
      number: phoneNumber,
      ses: stringSession,
      //status: "active"
    })

    // UPDATE SIKLINI BUTUNLAY TO'XTATISH VA ULANISHNI UZISH
    if (client._updateLoop) {
      client._updateLoop = () => {} // Background loopni zararsizlantirish
    }
    await client.destroy() // client.disconnect() o'rniga destroy ulanish va timerlarni butunlay o'chiradi
    await clearAuthClient(userId)

    return res.status(200).json({ success: true, status: "COMPLETED", message: "Akkaunt muvaffaqiyatli ulandi!" })

  } catch (error) {
    if (error.errorMessage === "SESSION_PASSWORD_NEEDED" || error.message?.includes("SESSION_PASSWORD_NEEDED")) {
      return res.status(200).json({ success: true, status: "2FA_REQUIRED", message: "2FA parol talab etiladi." })
    }

    console.error("verifyCode Error:", error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const verify2FA = async (req, res) => {
  try {
    const { userId, password } = req.body
    if (!userId || !password) {
      return res.status(400).json({ message: "userId va password kiritilishi shart!" })
    }

    const sessionData = getOrClient(userId)
    if (!sessionData || !sessionData.client) {
      return res.status(400).json({ message: "Sessiya topilmadi. Qaytadan raqam kiriting." })
    }

    const { client, phoneNumber } = sessionData

    if (!client.connected) {
      await client.connect()
    }

    await client.signInWithPassword(
      {
        apiId: Number(process.env.TELEGRAM_API_ID),
        apiHash: process.env.TELEGRAM_API_HASH,
      },
      {
        password: async () => String(password),
        onError: (err) => {
          throw err
        },
      }
    )

    const stringSession = client.session.save()
    const me = await client.getMe()

     await db.session.upsert({
      user_id: userId,
      number: phoneNumber,
      ses: stringSession,
      //status: "active"
    })

    // UPDATE SIKLINI BUTUNLAY TO'XTATISH VA ULANISHNI UZISH
    if (client._updateLoop) {
      client._updateLoop = () => {}
    }
    await client.destroy()
    await clearAuthClient(userId)

    return res.status(200).json({ success: true, status: "COMPLETED", message: "2FA tasdiqlandi va akkaunt ulandi!" })

  } catch (error) {
    console.error("verify2FA Error:", error)
    return res.status(400).json({ success: false, message: error.message })
  }
}