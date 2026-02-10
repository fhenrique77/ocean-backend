import { Router } from 'express'
import rootController from '../controllers/rootController.js'

const router = Router()

router.get('/', rootController.helloWorld)
router.get('/oi', rootController.olaMundo)

export default router
