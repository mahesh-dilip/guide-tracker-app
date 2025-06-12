// Load environment variables from the .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

// Create the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// --- CORS Configuration ---
// Get your Vercel URL (e.g., https://my-app.vercel.app)
const allowedOrigins = ['http://localhost:5173', 'https://guide-tracker-app.vercel.app/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// --- Middleware ---
app.use(cors(corsOptions)); // Use the new options
// Enable the Express server to understand incoming JSON data
app.use(express.json({ limit: '5mb' })); // Allow larger text inputs

// --- Routes ---
// All routes defined in api.js will be available under the /api prefix
// For example, /guides becomes /api/guides
app.use('/api', apiRoutes);

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


