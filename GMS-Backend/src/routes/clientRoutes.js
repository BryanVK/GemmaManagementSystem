import express from 'express';
import * as clientController from '../controllers/clientControl.js';
import upload from '../middleware/upload.js'; // Pastikan path ini sesuai dengan struktur folder Anda
const router = express.Router();
import multer from "multer";
const upload = multer({ dest: "uploads/" }); // atau sesuaikan dengan config


router.get('/clients', clientController.getClients);
router.post('/clients', clientController.createClients);
router.post('/clients/status', upload.array('images'), clientController.createClientsStatus);
router.put('/clients/:id', clientController.updateClients);
router.get('/machine', clientController.getMachine);
router.post('/machine', clientController.createMachine);
router.get('/users', clientController.getUsers);
router.get('/usersEmail', clientController.getUsersEmail);
router.post('/users', clientController.createUsers);
 export default router;
//test
 