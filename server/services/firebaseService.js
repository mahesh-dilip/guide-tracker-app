// Import the firebase-admin library
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

// Initialize the Firebase Admin SDK
// This allows our server to securely connect to our Firebase project
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "guide-cebd0.firebasestorage.app"  // Using your actual project ID
});

// Get references to Firestore and Storage
const db = admin.firestore();
const bucket = admin.storage().bucket();

// Export them for use in other files
export { db, bucket };
