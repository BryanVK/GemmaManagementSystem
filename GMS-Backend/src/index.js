import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js'; // <--- Tambahkan ini

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
app.use('/api', authRoutes); // <--- Tambahkan ini

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}`);
});
