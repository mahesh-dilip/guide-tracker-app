// Load environment variables from the .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

// Create the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// --- IMPORTANT: CORS Configuration ---

// This setup is more robust for deployment.
// It explicitly tells the server to trust requests from your Vercel URL.
const corsOptions = {
  // Replace this with your actual Vercel frontend URL
  origin: 'https://guide-tracker-app.vercel.app/', 
  optionsSuccessStatus: 200 // For legacy browser support
};

// Use the CORS middleware with our options
app.use(cors(corsOptions));

// This handles the "preflight" request that browsers send for complex requests (like POST)
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


