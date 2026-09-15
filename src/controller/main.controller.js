import db from '../models/index.js'
import { sendMessage, startAutoSending, stopAutoSending} from '../service/telegramService.js'

export const getUserSessions = async(req, res) => {
try {
  console.log(req.body);
  
  const userId = req.query.userId
  
  const sessions = await db.session.findAll({
    where: {user_id: userId}
  })
  res.status(200).json({success: true, data: sessions})
} catch (error) {
  console.log(error);
  
}
}



export const updateSession = async (req, res) =>{
  try {
    const { userId, sessionId, interval, message, groups } = req.body
    
    
    if (!userId || !sessionId) {
      return res.status(400).json({ message: "userId yoki sessionId yetishmayapti!" });
    }
    
    const session = await db.session.findByPk(sessionId)

    if(!session){
      return res.status(400).json({message: 'Sessiya topilmadi'})
    }else{
      session.interval = interval
      session.message = message
      await session.save()
      return res.status(200).json({message: "Sessiya malumotlari yangilandi"})
    }
    
    

  // res.status(200).json({message: 'ok'})
  } catch (error) {
    console.log(error);
    
  }
}

export const startSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body

    const session = await db.session.findByPk(sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Sessiya topilmadi' })
    }

    // 1. Message tekshiruvi
    if (!session.message || session.message.trim() === '') {
      return res.status(400).json({ 
        message: 'Sessiyada xabar (message) kiritilmagan!' 
      })
    }

    // // 2. Interval tekshiruvi (kamida 300 sekund)
    // if (!session.interval || Number(session.interval) < 300) {
    //   return res.status(400).json({ 
    //     message: 'Sessiya intervali kamida 300 sekund (5 daqiqa) bo\'lishi kerak!' 
    //   })
    // }

    // 3. Ushbu sessiyaga tegishli guruhlar mavjudligini tekshirish
    // const ses_groups = await db.group.findAll({ where: { ses_id: sessionId } })

    // if (!ses_groups || ses_groups.length === 0) {
    //   return res.status(400).json({ 
    //     message: 'Sessiyaga kamida bitta guruh biriktirilgan bo\'lishi kerak!' 
    //   })
    // }

    // sendMessage(sessionId, userId)
    startAutoSending(sessionId, userId)
    return res.status(200).json({ 
      message: 'Sessiya muvaffaqiyatli ishga tushirildi',
      
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Serverda xatolik yuz berdi' })
  }
}

export const stopSession = async (req, res) => {
  try {
     const { userId, sessionId } = req.body

     stopAutoSending(sessionId, userId)
     res.status(200).json({message: 'Ok'})
  } catch (error) {
    
  }
}