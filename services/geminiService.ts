import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const fetchVavatchInfo = async (): Promise<GeminiResponse> => {
  if (!GEMINI_API_KEY) {
    return {
      description: "API Key missing. Please provide a valid API Key to retrieve data from the Ship Mind.",
      facts: ["Vavatch is a Culture Orbital.", "It appears in the book Consider Phlebas.", "Orbitals are held together by force fields."]
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = ai.models;
    
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Describe the Vavatch Orbital from Iain M. Banks' Consider Phlebas. Focus on its immense scale compared to a planet like Earth. Return the response as a JSON object with a 'description' string (max 80 words) and an array of 3 fascinating 'facts' strings.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            facts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as GeminiResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      description: "Communication with the Ship Mind interrupted. Accessing local cache: Vavatch is a fourteen-million-kilometer circumference Orbital, significantly larger than any terrestrial planet.",
      facts: [
        "Constructed from super-tensile material.",
        "Simulates gravity via rotation.",
        "Destroyed by the Culture to prevent Idiran capture."
      ]
    };
  }
};