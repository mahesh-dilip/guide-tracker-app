// Load environment variables from the .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

// Create the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) so our frontend can call the API
app.use(cors());
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
