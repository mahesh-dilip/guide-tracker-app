// Import the Google Generative AI library
import { GoogleGenerativeAI } from '@google/generative-ai';

// This function takes the raw text from the user and returns structured JSON from Gemini
async function getStructuredGuide(rawText) {
  // Access your Gemini API key from the .env file
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // This is the detailed prompt we send to the AI.
  // It tells the AI exactly what to do and what format to use.
  const prompt = `
You are a master content analysis and structuring engine. Your primary function is to meticulously analyze user-submitted text, which may be in any language, and transform it into a precise, well-structured JSON object that strictly follows the required schema.

**Analysis & Transformation Rules:**

1.  **Translate to English:** Before any analysis, detect the language of the provided text. If it is not in English, translate the entire content into clear, fluent English. This includes handling text with a mix of languages.
2.  **Categorize Content:** After translation, determine the most fitting category for the content from this list: \`RECIPE\`, \`TECHNICAL_TUTORIAL\`, \`DIY_PROJECT\`, \`STUDY_GUIDE\`, or \`GENERAL\`.
3.  **Infer Title & Structure:** Infer a concise and descriptive \`title\`. Logically segment the content into \`chapters\` and then into sequential \`steps\`. A step should be a single, clear action. If no logical chapters exist, create a single chapter titled "Main Steps."
4.  **Error Handling:** If the user's text is nonsensical, too short to be a guide, or cannot be structured, your entire response MUST be the following JSON object and nothing else: \`{"error": "Content is not a valid guide and cannot be processed."}\`.

**Required JSON Output Schema:**
Your final output MUST be ONLY the raw JSON object, without any surrounding text or markdown formatting.

<json_schema>
{
  "title": "A concise, inferred title for the guide",
  "contentType": "The category you determined",
  "chapters": [
    {
      "title": "Title of the first chapter",
      "steps": [
        {
          "content": "Content of the first step in this chapter."
        }
      ]
    }
  ]
}
</json_schema>

---
**Example of Perfect Execution:**

<user_text>
Spaghetti Carbonara recipe
Ingredients: 200g spaghetti, 100g pancetta, 2 large eggs, 50g pecorino cheese, black pepper.
Instructions:
1. Cook the spaghetti.
2. Fry the pancetta.
3. Whisk eggs and cheese.
4. Mix and serve.
</user_text>

<json_output>
{
  "title": "Spaghetti Carbonara Recipe",
  "contentType": "RECIPE",
  "chapters": [
    {
      "title": "Ingredients",
      "steps": [
        {"content": "200g spaghetti"},
        {"content": "100g pancetta"},
        {"content": "2 large eggs"},
        {"content": "50g pecorino cheese"},
        {"content": "black pepper"}
      ]
    },
    {
      "title": "Instructions",
      "steps": [
        {"content": "Cook the spaghetti."},
        {"content": "Fry the pancetta."},
        {"content": "Whisk eggs and cheese."},
        {"content": "Mix and serve."}
      ]
    }
  ]
}
</json_output>

---

**Now, process the following user-provided text:**

<user_text>
${rawText}
</user_text>
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
