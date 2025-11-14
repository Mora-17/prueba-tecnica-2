import { Router } from 'express';
import {
  crearRuleta,
  abrirRuleta,
  cerrarRuleta,
  listarRuletas,
  obtenerRuleta
} from '../controllers/ruleta.controllers.js';

const router = Router();


router.post('/', crearRuleta);


router.put('/:id/abrir', abrirRuleta);


router.put('/:id/cerrar', cerrarRuleta);


router.get('/', listarRuletas);


router.get('/:id', obtenerRuleta);

export default router;