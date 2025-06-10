// Import the Google Generative AI library
import { GoogleGenerativeAI } from '@google/generative-ai';

// This function takes the raw text from the user and returns structured JSON from Gemini
async function getStructuredGuide(rawText) {
  // Access your Gemini API key from the .env file
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // This is the detailed prompt we send to the AI.
  // It tells the AI exactly what to do and what format to use.
  const prompt = `
    You are an expert content analysis and structuring engine. Your task is to analyze the user-provided text dump and convert it into a structured, clean JSON object.

    Follow these instructions precisely:

    1.  **Analyze the Content:** Read the entire text to understand its purpose.
    2.  **Determine the Content Type:** Categorize the content into one of the following: \`RECIPE\`, \`TECHNICAL_TUTORIAL\`, \`DIY_PROJECT\`, \`STUDY_GUIDE\`, or \`GENERAL\`.
    3.  **Generate the JSON:** Create a single JSON object. Infer a concise \`title\` from the text. Logically divide the content into \`chapters\`. Break down each chapter into sequential \`steps\`. Each step should be a single, clear, actionable item. If there are no obvious chapters, create a single chapter with a suitable title like "Main Steps".

    **Required JSON Format:**
    \`\`\`json
    {
      "title": "A concise, inferred title for the guide",
      "contentType": "The category you determined",
      "chapters": [
        {
          "title": "Title of the first chapter",
          "steps": [
            {"content": "Content of the first step in this chapter."},
            {"content": "Content of the second step in this chapter."}
          ]
        }
      ]
    }
    \`\`\`

    **Final Output:** Your final response must ONLY be the raw JSON object. Do not include any conversational text, explanations, or markdown formatting like \`\`\`json \`\`\` before or after the object.

    **Here is the user's text dump:**
    ---
    ${rawText}
    ---
  `;

  try {
    // Send the prompt to the Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();

    // The AI might sometimes still include the markdown tags, so we clean them up.
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
    
    // Convert the text response into a real JSON object
    return JSON.parse(cleanedJsonText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // If the API fails, we throw an error so our controller can handle it.
    throw new Error("Failed to process content with the AI model.");
  }
}

// Export the function
export { getStructuredGuide };
