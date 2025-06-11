import express from 'express';
import multer from 'multer';
import { createGuide, getGuideById, createGuideFromAudio, exportGuide } from '../controllers/guideController.js';
import { toggleStepCompletion, addNoteToStep, addAttachmentToStep } from '../controllers/stepController.js';

// Create a new router object
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio files
  },
});

// Guide routes
router.post('/guides/from-text', createGuide); // Renamed for clarity
router.get('/guides/:guideId', getGuideById);
router.get('/guides/:guideId/export', exportGuide);
router.post('/guides/from-audio', upload.single('audio'), createGuideFromAudio);

// Step routes
router.put('/guides/:guideId/steps/:stepId/complete', toggleStepCompletion);
router.post('/guides/:guideId/steps/:stepId/notes', addNoteToStep);
router.post('/guides/:guideId/steps/:stepId/attachments', upload.single('file'), addAttachmentToStep);

// Export the router
export default router;
