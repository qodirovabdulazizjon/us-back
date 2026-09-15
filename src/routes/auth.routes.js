import { Router } from 'express'
import { sendCode, verifyCode, verify2FA } from '../controller/auth.controller.js'

const router = Router()

router.post("/send-code", sendCode)
router.post("/verify-code", verifyCode)
router.post("/verify-2fa", verify2FA)

export default router