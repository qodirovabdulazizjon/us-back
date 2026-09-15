import {Router} from 'express'
import {getUserSessions, updateSession, startSession, stopSession} from '../controller/main.controller.js'

const router = Router()

router.get('/sessions', getUserSessions)

router.post('/sessions/update', updateSession)
router.post('/start/session', startSession)
router.post('/stop/session', stopSession)


export default router