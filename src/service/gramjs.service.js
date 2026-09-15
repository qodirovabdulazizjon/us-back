import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { Logger } from 'telegram/extensions/Logger.js'

// GramJS ichki TIMEOUT va keraksiz loglarini konsolga chiqarishni o'chirish
Logger.setLevel("none")

// Vaqtinchalik sessiyalar va klientlarni saqlash uchun Map
const authClients = new Map()

/**
 * Yangi TelegramClient yaratish funksiyasi
 * @param {string} sessionString 
 * @returns {TelegramClient}
 */
export const createClient = (sessionString = "") => {
  const client = new TelegramClient(
    new StringSession(sessionString),
    Number(process.env.API_ID),
    process.env.API_HASH,
    {
      connectionRetries: 3,
      requestRetries: 3,
      autoReconnect: false,
      useWSS: false,
      receiveUpdates: false, // Background update loop-ni faollashtirmaydi
    }
  )

  // Fon xatolarini (TIMEOUT va hokazo) e'tiborsiz qoldirish
  client._errorHandler = () => {}

  return client
}

/**
 * Foydalanuvchi uchun saqlangan klientni olish yoki yangisini yaratish
 * @param {string|number} userId 
 * @returns {{ client: TelegramClient, phoneCodeHash?: string, phoneNumber?: string }}
 */
export const getOrClient = (userId) => {
  const key = String(userId)

  if (!authClients.has(key)) {
    const client = createClient("")
    authClients.set(key, { client })
  }

  return authClients.get(key)
}

/**
 * Autentifikatsiya tugagach vaqtinchalik klientni tozalash
 * @param {string|number} userId 
 */
export const clearAuthClient = async (userId) => {
  const key = String(userId)
  const sessionData = authClients.get(key)

  if (sessionData && sessionData.client) {
    try {
      // Update siklini to'xtatish va resurslarni tozalash
      if (sessionData.client._updateLoop) {
        sessionData.client._updateLoop = () => {}
      }
      await sessionData.client.destroy()
    } catch (e) {
      // Uzilishdagi xatolarni e'tiborsiz qoldirish
    }
  }

  authClients.delete(key)
}