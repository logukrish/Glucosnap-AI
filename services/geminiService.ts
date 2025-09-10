
import { GoogleGenAI, Type } from "@google/genai";
import type { MealItem } from '../types';

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeMealPhoto = async (
  base64Image: string,
  mimeType: string
): Promise<MealItem[]> => {
    // This check is a safeguard for development, in a real app this should be handled gracefully.
  if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      // Fallback to mock data if API key is not available
      return Promise.resolve([
          { name: "Mock Item 1 (No API Key)", calories: 300, carbs: 35, protein: 20, fat: 10 },
          { name: "Mock Item 2 (No API Key)", calories: 150, carbs: 20, protein: 5, fat: 5 },
      ]);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = fileToGenerativePart(base64Image, mimeType);

  const prompt = "Analyze the image of this meal. Identify each food item, estimate its portion size, and provide its nutritional information (calories, protein, carbs, fat). Return the response as a JSON array of objects.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Name of the food item.",
              },
              calories: {
                type: Type.NUMBER,
                description: "Estimated total calories for the item.",
              },
              protein: {
                type: Type.NUMBER,
                description: "Estimated grams of protein.",
              },
              carbs: {
                type: Type.NUMBER,
                description: "Estimated grams of carbohydrates.",
              },
              fat: {
                type: Type.NUMBER,
                description: "Estimated grams of fat.",
              },
            },
            required: ["name", "calories", "protein", "carbs", "fat"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    // Ensure the result is an array of MealItem
    if (Array.isArray(result) && result.every(item => 'name' in item && 'calories' in item)) {
        return result as MealItem[];
    } else {
        console.error("Parsed JSON is not in the expected format:", result);
        throw new Error("AI response was not in the expected format.");
    }

  } catch (error) {
    console.error("Error analyzing meal photo:", error);
    throw new Error("Failed to get nutritional information from the image.");
  }
};
