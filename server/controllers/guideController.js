import { getStructuredGuide } from '../services/geminiService.js';
import { transcribeAudio } from '../services/elevenLabsService.js';
import { db } from '../services/firebaseService.js';
import { v4 as uuidv4 } from 'uuid';
import { exportToMarkdown, exportToPdf } from '../services/exportService.js';

// This function handles the creation of a new guide
export async function createGuide(req, res) {
  try {
    // 1. Get the raw text from the user's request
    const { rawContent } = req.body;
    if (!rawContent) {
      return res.status(400).send({ message: "rawContent is required." });
    }

    // 2. Use our Gemini service to get the structured guide
    console.log("Sending content to Gemini...");
    const structuredGuide = await getStructuredGuide(rawContent);
    console.log("Received structured guide from Gemini.");

    // 3. Prepare the final data object to be saved in Firestore
    const newGuide = {
      ...structuredGuide, // Add title, contentType, and chapters from Gemini
      ownerId: "temp-user-id", // We'll add real users later
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originalContent: rawContent,
      // Add unique IDs to all chapters and steps
      chapters: structuredGuide.chapters.map(chapter => ({
        ...chapter,
        id: uuidv4(),
        steps: chapter.steps.map(step => ({
          ...step,
          id: uuidv4(),
          isCompleted: false,
          notes: [],
          attachments: [],
        })),
      })),
    };

    // 4. Save the new guide to the 'guides' collection in Firestore
    const guideRef = await db.collection('guides').add(newGuide);
    console.log(`Successfully created guide with ID: ${guideRef.id}`);

    // 5. Send a success response back to the user with the new guide's ID
    res.status(201).send({
      message: "Guide created successfully!",
      guideId: guideRef.id,
      data: newGuide,
    });

  } catch (error) {
    console.error("Error creating guide:", error);
    res.status(500).send({ message: "Failed to create guide.", error: error.message });
  }
}

// This function gets a single guide by its ID
export async function getGuideById(req, res) {
  try {
    const { guideId } = req.params;
    const doc = await db.collection('guides').doc(guideId).get();

    if (!doc.exists) {
      return res.status(404).send({ message: "Guide not found." });
    }

    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error getting guide:", error);
    res.status(500).send({ message: "Failed to get guide.", error: error.message });
  }
}

export async function exportGuide(req, res) {
  try {
    const { guideId } = req.params;
    const { format } = req.query; // 'pdf' or 'markdown'

    const doc = await db.collection('guides').doc(guideId).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Guide not found." });
    }
    const guideData = doc.data();

    if (format === 'markdown') {
      const markdown = exportToMarkdown(guideData);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${guideData.title}.md"`);
      res.status(200).send(markdown);

    } else if (format === 'pdf') {
      const pdfBuffer = exportToPdf(guideData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${guideData.title}.pdf"`);
      res.status(200).send(Buffer.from(pdfBuffer));

    } else {
      return res.status(400).send({ message: "Invalid format requested." });
    }
  } catch (error) {
    console.error("Error exporting guide:", error);
    res.status(500).send({ message: "Failed to export guide." });
  }
}

export async function createGuideFromAudio(req, res) {
  try {
    // 1. Get the audio file from the request (processed by multer)
    if (!req.file) {
      return res.status(400).send({ message: "Audio file is required." });
    }
    
    // 2. Transcribe the audio file buffer to get the text
    const transcribedText = await transcribeAudio(req.file.buffer);

    if (!transcribedText || transcribedText.trim().length === 0) {
        return res.status(400).send({ message: "Transcription resulted in empty text. Please try speaking more clearly."});
    }

    // 3. Use the transcribed text to get the structured guide from Gemini
    //    This reuses our existing powerful Gemini service!
    const structuredGuide = await getStructuredGuide(transcribedText);

    // 4. Prepare the final data object to be saved in Firestore
    const newGuide = {
      ...structuredGuide,
      ownerId: "temp-user-id",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originalContent: transcribedText, // Save the transcribed text
      chapters: structuredGuide.chapters.map(chapter => ({
        ...chapter,
        id: uuidv4(),
        steps: chapter.steps.map(step => ({
          ...step,
          id: uuidv4(),
          isCompleted: false,
          notes: [],
          attachments: [],
        })),
      })),
    };

    // 5. Save the new guide to Firestore
    const guideRef = await db.collection('guides').add(newGuide);
    console.log(`Successfully created guide from audio. ID: ${guideRef.id}`);

    // 6. Send a success response back to the user
    res.status(201).send({
      message: "Guide created successfully from audio!",
      guideId: guideRef.id,
      data: newGuide,
    });

  } catch (error) {
    console.error("Error creating guide from audio:", error);
    res.status(500).send({ message: "Failed to create guide from audio.", error: error.message });
  }
}
