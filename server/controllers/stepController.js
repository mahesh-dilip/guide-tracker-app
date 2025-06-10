import { db, bucket } from '../services/firebaseService.js';
import { v4 as uuidv4 } from 'uuid';

// This is a helper function to recalculate the overall progress of a guide.
function calculateProgress(guide) {
    let completedSteps = 0;
    let totalSteps = 0;
    guide.chapters.forEach(chapter => {
        totalSteps += chapter.steps.length;
        chapter.steps.forEach(step => {
            if (step.isCompleted) {
                completedSteps++;
            }
        });
    });
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
}

// Handles toggling the completion status of a step
export async function toggleStepCompletion(req, res) {
    try {
        const { guideId, stepId } = req.params;
        const guideRef = db.collection('guides').doc(guideId);
        const doc = await guideRef.get();

        if (!doc.exists) {
            return res.status(404).send({ message: "Guide not found." });
        }

        const guideData = doc.data();
        let stepFound = false;
        let isCompleted = false;

        // Find the correct step and toggle its `isCompleted` status
        guideData.chapters.forEach(chapter => {
            const step = chapter.steps.find(s => s.id === stepId);
            if (step) {
                step.isCompleted = !step.isCompleted;
                isCompleted = step.isCompleted;
                stepFound = true;
            }
        });

        if (!stepFound) {
            return res.status(404).send({ message: "Step not found." });
        }

        // Recalculate progress
        guideData.progress = calculateProgress(guideData);
        guideData.updatedAt = new Date().toISOString();

        // Save the entire updated guide back to Firestore
        await guideRef.set(guideData);

        res.status(200).send({
            message: "Step status updated.",
            progress: guideData.progress,
            isCompleted
        });
    } catch (error) {
        console.error("Error toggling step completion:", error);
        res.status(500).send({ message: "Failed to update step status." });
    }
}

// Handles adding a new note to a step
export async function addNoteToStep(req, res) {
    try {
        const { guideId, stepId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).send({ message: "Note content is required." });
        }

        const guideRef = db.collection('guides').doc(guideId);
        const doc = await guideRef.get();

        if (!doc.exists) {
            return res.status(404).send({ message: "Guide not found." });
        }

        const guideData = doc.data();
        let stepFound = false;
        let newNote;

        // Find the step and add the new note
        guideData.chapters.forEach(chapter => {
            const step = chapter.steps.find(s => s.id === stepId);
            if (step) {
                newNote = {
                    id: uuidv4(),
                    content: content,
                    createdAt: new Date().toISOString(),
                };
                step.notes.push(newNote);
                stepFound = true;
            }
        });

        if (!stepFound) {
            return res.status(404).send({ message: "Step not found." });
        }
        
        guideData.updatedAt = new Date().toISOString();

        // Save the updated guide
        await guideRef.set(guideData);

        res.status(201).send({ message: "Note added successfully.", note: newNote });

    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).send({ message: "Failed to add note." });
    }
}

// Handles uploading an attachment and linking it to a step
export async function addAttachmentToStep(req, res) {
  try {
    const { guideId, stepId } = req.params;

    // multer middleware gives us the `req.file` object
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    const guideRef = db.collection('guides').doc(guideId);
    const doc = await guideRef.get();

    if (!doc.exists) {
      return res.status(404).send({ message: "Guide not found." });
    }
    const guideData = doc.data();

    // Create a unique filename for the uploaded file
    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // Create a stream to upload the file buffer
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      console.error("Upload Error:", error);
      res.status(500).send({ message: 'Error uploading file.' });
    });

    blobStream.on('finish', async () => {
      // The file is now uploaded. Make it publicly accessible.
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Now, find the step and add the attachment metadata to it.
      let stepFound = false;
      let newAttachment;
      guideData.chapters.forEach(chapter => {
        const step = chapter.steps.find(s => s.id === stepId);
        if (step) {
          newAttachment = {
            id: uuidv4(),
            fileName: fileName,
            fileUrl: publicUrl,
            createdAt: new Date().toISOString(),
          };
          if (!step.attachments) step.attachments = [];
          step.attachments.push(newAttachment);
          stepFound = true;
        }
      });

      if (!stepFound) {
        return res.status(404).send({ message: "Step not found." });
      }

      // Save the updated guide document back to Firestore
      await guideRef.set(guideData);

      res.status(201).send({
        message: "File uploaded and linked successfully.",
        attachment: newAttachment,
      });
    });

    // End the stream by sending the file buffer
    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).send({ message: "Failed to add attachment." });
  }
} 