import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';

const app = express();
const port = 3000;

// Middleware
app.use(cors({
<<<<<<< HEAD
  origin: 'http://82.112.227.86:5173', // alamat frontend kamu
=======
  origin: '*', // alamat frontend kamu
>>>>>>> 561ba1bc26eda66e93f52e323c72cff4507c13ba
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

