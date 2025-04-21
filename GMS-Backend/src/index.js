import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // <--- Tambahkan ini

import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Diperlukan untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Routes
app.use('/api', clientRoutes);
app.use('/api', authRoutes);

// Serve folder uploads
// ✅ arahkan langsung dari project root
app.use('/uploads', express.static(path.resolve('uploads')));


// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
});
