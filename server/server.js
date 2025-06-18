// Load environment variables from the .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

// Create the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// --- IMPORTANT: Flexible CORS Configuration ---

// This setup allows for multiple specific origins.
const allowedOrigins = [
  'http://localhost:5175', // For local development
  'https://guide-tracker-app.vercel.app' // Your Vercel URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// Use the CORS middleware with our options
app.use(cors(corsOptions));

// This handles the "preflight" request
app.options('*', cors(corsOptions)); 

// --- End of CORS Configuration ---

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


