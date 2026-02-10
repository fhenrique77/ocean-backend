import { Router } from 'express'
import personagensController from '../controllers/personagensController.js'

const router = Router()

router.get('/', personagensController.listar)
router.get('/:id', personagensController.buscarPorId)
router.post('/', personagensController.criar)
router.post('/importar', personagensController.importar)
router.put('/:id', personagensController.atualizar)
router.delete('/:id', personagensController.remover)

export default router
