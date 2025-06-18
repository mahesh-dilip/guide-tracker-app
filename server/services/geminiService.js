// Import the Google Generative AI library
import { GoogleGenerativeAI } from '@google/generative-ai';

// This is our updated function for structuring content
export async function getStructuredGuide(rawText) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // The prompt is updated with specific instructions for recipes
  const prompt = `
    You are a master content analysis and structuring engine. Your primary function is to meticulously analyze user-submitted text and transform it into a precise, well-structured JSON object.

    **Analysis & Transformation Rules:**

    1.  **Translate to English:** Before any analysis, detect the language of the provided text. If it is not English, translate the entire content into clear, fluent English.
    2.  **Categorize Content:** Determine the most fitting category: \`RECIPE\`, \`TECHNICAL_TUTORIAL\`, \`DIY_PROJECT\`, \`STUDY_GUIDE\`, or \`GENERAL\`.
    3.  **Infer Title & Structure:** Infer a concise \`title\`. Logically segment the content into \`chapters\` and \`steps\`.

    ---
    **SPECIAL RULE FOR RECIPES:**
    If you determine the \`contentType\` is "RECIPE", you MUST follow this specific structure:
    - The JSON object MUST have a top-level key named "ingredients".
    - "ingredients" MUST be an array of objects, where each object has a "name" and a "quantity" string.
    - The "steps" in the "Instructions" chapter should be rewritten to naturally include the ingredient quantities.

    **Recipe JSON Schema Example:**
    \`\`\`json
    {
      "title": "Spaghetti Carbonara",
      "contentType": "RECIPE",
      "ingredients": [
        { "name": "spaghetti", "quantity": "200g" },
        { "name": "pancetta", "quantity": "100g" }
      ],
      "chapters": [
        {
          "title": "Instructions",
          "steps": [
            {"content": "Cook 200g of spaghetti until al dente."},
            {"content": "While the pasta cooks, fry 100g of pancetta until crispy."}
          ]
        }
      ]
    }
    \`\`\`
    ---

    **General JSON Schema (for all other types):**
    For any \`contentType\` other than "RECIPE", use the standard structure without the "ingredients" key.

    \`\`\`json
    {
      "title": "A concise, inferred title",
      "contentType": "The determined category",
      "chapters": [
        {
          "title": "Title of the chapter",
          "steps": [{"content": "Content of the step."}]
        }
      ]
    }
    \`\`\`

    **Error Handling:**
    If the text is nonsensical or cannot be structured, your entire response MUST be this exact JSON object: \`{"error": "Content is not a valid guide and cannot be processed."}\`

    **Final Output:**
    Your response must ONLY be the raw JSON object, without any surrounding text or markdown formatting.

    ---
    **Now, process the following user-provided text:**
    <user_text>
    ${rawText}
    </user_text>
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
    return JSON.parse(cleanedJsonText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to process content with the AI model.");
  }
}

// --- NEW FUNCTION ---
// This function answers a user's question based on the guide's context.
export async function askAboutGuide(guideContext) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // This is our detailed, context-rich prompt.
    const prompt = `
        You are a helpful assistant for the "Guide Tracker" app. Your goal is to answer a user's question about the guide they are currently following. Be concise and helpful.

        CONTEXT:
        ---
        1.  **THE ORIGINAL TRANSCRIPT:**
            ${guideContext.originalContent}
        ---
        2.  **THE STRUCTURED GUIDE:**
            ${JSON.stringify(guideContext.chapters, null, 2)}
        ---
        3.  **THE USER'S CURRENT LOCATION:**
            The user is currently on Step: "${guideContext.currentStepContent}"
        ---

        Based on all the context above, please answer the following question. 

        **USER'S QUESTION:**
        "${guideContext.question}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API for asking question:", error);
        throw new Error("Failed to get an answer from the AI model.");
    }
}
