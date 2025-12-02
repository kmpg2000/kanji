import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KanjiProblem } from "../types";

const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        sentence: { type: Type.STRING, description: "The sentence containing the kanji problem, use '___' for the blank part." },
        target: { type: Type.STRING, description: "The correct Kanji character(s) that fits in the blank." },
        reading: { type: Type.STRING, description: "The hiragana reading of the target kanji." },
        distractors: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 incorrect options. If the problem is about Kanji, these should be similar looking but wrong Kanji. If reading, wrong readings."
        }
      },
      required: ["sentence", "target", "reading", "distractors"]
    }
};

export const generateQuizFromImage = async (base64Images: string[], apiKey: string): Promise<KanjiProblem[]> => {
  if (!apiKey) throw new Error("API Key required");

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the attached image(s) of a Japanese Kanji worksheet. 
    Identify the fill-in-the-blank questions from ALL images. 
    Create a single JSON list of problems based on the content.
    For each problem, provide the sentence with '___' where the answer goes, the correct Kanji answer, its reading, and 3 believable wrong choices (distractors).
    Ensure the JSON is valid.
  `;

  // Create image parts for all uploaded images
  const imageParts = base64Images.map(img => ({
      inlineData: {
          mimeType: "image/jpeg",
          data: img
      }
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
            { text: prompt },
            ...imageParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    // Add IDs
    return data.map((item: any, index: number) => ({
        ...item,
        id: `gen-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};