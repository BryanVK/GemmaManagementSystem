import express from 'express';
import * as clientController from '../controllers/clientControl.js';
import upload from '../middleware/upload.js'; // Pastikan path ini sesuai dengan struktur folder Anda
const router = express.Router();

router.get('/clients', clientController.getClients);
router.post('/clients', clientController.createClients);
router.post('/clients/status', upload.single('image'), clientController.createClientsStatus);
router.put('/clients/:id', clientController.updateClients);
router.get('/machine', clientController.getMachine);
 export default router;
