import express from 'express';
import multer from 'multer';
import { createGuide, getGuideById } from '../controllers/guideController.js';
import { toggleStepCompletion, addNoteToStep, addAttachmentToStep } from '../controllers/stepController.js';

// Create a new router object
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Guide routes
router.post('/guides', createGuide);
router.get('/guides/:guideId', getGuideById);

// Step routes
router.put('/guides/:guideId/steps/:stepId/complete', toggleStepCompletion);
router.post('/guides/:guideId/steps/:stepId/notes', addNoteToStep);
router.post('/guides/:guideId/steps/:stepId/attachments', upload.single('file'), addAttachmentToStep);

// Export the router
export default router;
