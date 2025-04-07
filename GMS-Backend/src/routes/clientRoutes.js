import express from 'express';
import * as clientController from '../controllers/clientControl.js';

const router = express.Router();

router.get('/clients', clientController.getClients);
router.post('/clients', clientController.createClients);
router.put('/clients/:id', clientController.updateClients);
router.get('/machine', clientController.getMachine);

// Pastikan router diekspor sebagai default
export default router;
