import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://82.112.227.86:5174', // alamat frontend kamu
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Routes
app.use('/api', clientRoutes);

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log("listening on port 3000")
});

