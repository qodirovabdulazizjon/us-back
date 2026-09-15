import fs from 'fs';
import db from '../models/index.js';
import dotenv from 'dotenv';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

dotenv.config({ quiet: true });

const API_ID = process.env.API_ID;
const API_HASH = process.env.API_HASH;

// Clientlar va aktiv taymerlar xaritasi (Map)
const clientPool = new Map();
const activeTasks = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Pool'dan client olish
const getClient = async (sessionRecord) => {
  const poolKey = `${sessionRecord.number}_${sessionRecord.user_id}`;

  if (clientPool.has(poolKey)) {
    const existingClient = clientPool.get(poolKey);
    if (existingClient.connected) {
      return existingClient;
    }
  }

  const client = new TelegramClient(
    new StringSession(sessionRecord.ses),
    Number(API_ID),
    API_HASH,
    { connectionRetries: 5 }
  );

  await client.connect();
  clientPool.set(poolKey, client);
  return client;
};

// Bir martalik xabar yuborish funksiyasi
export const sendMessage = async (sessionId, userId) => {
  try {
    const now = new Date().toLocaleString();

    const session = await db.session.findOne({
      where: { id: sessionId, user_id: userId }
    });

    if (!session) {
      console.error("❌ Sessiya topilmadi.");
      return;
    }

    const localClient = await getClient(session);

    const groups = await db.group.findAll({
      where: { ses_id: session.id }
    });

    if (!groups || !groups.length) {
      console.log("⚠️ Yuborish uchun guruhlar topilmadi.");
      return;
    }

    for (const group of groups) {
      try {
        const filePath = `./bots/downloads/${session.imgUrl}`;

        if (group.photo && session.imgUrl && fs.existsSync(filePath)) {
          await localClient.sendFile(group.group_id, {
            file: filePath,
            caption: session.message || '',
          });
          console.log(`✅ Guruh (${group.group_id}): Rasm yuborildi [${now}]`);
        } else {
          await localClient.sendMessage(group.group_id, {
            message: session.message || '',
          });
          console.log(`✅ Guruh (${group.group_id}): Matn yuborildi [${now}]`);
        }

        await sleep(3000); // Spam blokirovkasidan saqlanish uchun 3 soniya kechikish

      } catch (groupErr) {
        console.error(`❌ Guruhga (${group.group_id}) yuborishda xato:`, groupErr.message);
      }
    }

  } catch (err) {
    console.error("❌ Umumiy jarayonda xatolik:", err.message);
  }
};

// Avto-yuborishni (Interval bo'yicha) boshlash funksiyasi
export const startAutoSending = async (sessionId, userId) => {
  const taskKey = `${sessionId}_${userId}`;

  // Agar taymer allaqachon mavjud bo'lsa, qayta yaratmaymiz
  if (activeTasks.has(taskKey)) {
    console.log(`⚠️ Avto-yuborish allaqachon ishlamoqda: ${taskKey}`);
    return;
  }

  const run = async () => {
    let intervalMs = 60000; // Standart qiymat: 60 soniya

    try {
      const session = await db.session.findOne({
        where: { id: sessionId, user_id: userId }
      });

      if (!session) {
        console.error("❌ Sessiya topilmadi, taymer to'xtatildi.");
        stopAutoSending(sessionId, userId);
        return;
      }

      intervalMs = (session.interval || 60) * 1000;

      // Xabarni yuborish
      await sendMessage(sessionId, userId);

    } catch (err) {
      console.error("❌ Avto-yuborish taymerida xatolik:", err.message);
    } finally {
      // Faqat taymer xotiradan (activeTasks) o'chirilmagan bo'lsagina keyingi siklni rejalashtiramiz
      if (activeTasks.has(taskKey)) {
        const timerId = setTimeout(run, intervalMs);
        activeTasks.set(taskKey, timerId);
      }
    }
  };

  // Taymer ishga tushishidan oldin belgilab qo'yamiz
  activeTasks.set(taskKey, null);
  run();
};

// Avto-yuborishni to'xtatish funksiyasi
export const stopAutoSending = (sessionId, userId) => {
  const taskKey = `${sessionId}_${userId}`;

  if (activeTasks.has(taskKey)) {
    const timerId = activeTasks.get(taskKey);
    if (timerId) {
      clearTimeout(timerId); // Rejalashtirilgan setTimeout'ni bekor qilish
    }
    activeTasks.delete(taskKey); // Xotiradan o'chirish
    console.log(`🛑 Avto-yuborish to'xtatildi: ${taskKey}`);
    return true;
  }

  console.log(`⚠️ To'xtatish uchun aktiv taymer topilmadi: ${taskKey}`);
  return false;
};