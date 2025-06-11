import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize the client with your API key from the .env file
const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

/**
 * Transcribes an audio file buffer using the ElevenLabs API.
 * @param {Buffer} audioBuffer The audio data from the uploaded file.
 * @returns {Promise<string>} The transcribed text.
 */
export async function transcribeAudio(audioBuffer) {
    try {
        console.log("Sending audio to ElevenLabs for transcription...");
        console.log("API Key present:", !!process.env.ELEVENLABS_API_KEY);
        console.log("Audio buffer size:", audioBuffer.length, "bytes");

        // Create a Blob from the buffer
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        console.log("Created audio blob:", audioBlob.size, "bytes");

        const response = await elevenlabs.speechToText.convert({
            modelId: "scribe_v1",
            file: audioBlob,
            tag_audio_events: true,
            timestamps_granularity: "word",
            diarize: false,
            file_format: "other"
        });
        
        console.log("Transcription successful.");
        console.log("Response received:", response);
        return response.text;

    } catch (error) {
        console.error("Detailed error from ElevenLabs:", {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            body: error.body,
            rawResponse: error.rawResponse
        });
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
} 