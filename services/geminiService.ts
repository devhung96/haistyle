import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Preferences, Hairstyle } from "../types";
import { getPrompts } from '../locales/prompts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function base64ToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export async function analyzeFaceShape(
  imageDataUrl: string,
  language: 'en' | 'vi'
): Promise<string> {
  const [metadata, base64Data] = imageDataUrl.split(',');
  if (!base64Data) throw new Error("Invalid image data URL");
  
  const mimeType = metadata.match(/:(.*?);/)?.[1];
  if (!mimeType) throw new Error("Could not determine MIME type from image data URL");

  const imagePart = base64ToGenerativePart(base64Data, mimeType);
  const prompts = getPrompts(language);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompts.faceShape.prompt }, imagePart] },
      config: {
        systemInstruction: prompts.faceShape.systemInstruction,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for face shape analysis:", error);
    throw new Error("Failed to analyze face shape from the AI.");
  }
}

export async function getHairstyleSuggestions(
  imageDataUrl: string,
  prefs: Preferences,
  faceShape: string | null,
  language: 'en' | 'vi'
): Promise<Hairstyle[]> {
  const [metadata, base64Data] = imageDataUrl.split(',');
  if (!base64Data) {
    throw new Error("Invalid image data URL");
  }

  const mimeType = metadata.match(/:(.*?);/)?.[1];
  if (!mimeType) {
    throw new Error("Could not determine MIME type from image data URL");
  }

  const imagePart = base64ToGenerativePart(base64Data, mimeType);
  const prompts = getPrompts(language);
  
  const prompt = prompts.suggestions.getPrompt(prefs, faceShape);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
            { text: prompt },
            imagePart
        ]
      },
      config: {
        systemInstruction: prompts.suggestions.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hairstyles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: prompts.suggestions.schema.name
                  },
                  description: {
                    type: Type.STRING,
                    description: prompts.suggestions.schema.description
                  },
                  reason: {
                    type: Type.STRING,
                    description: prompts.suggestions.schema.reason
                  }
                },
                required: ["name", "description", "reason"]
              }
            }
          },
          required: ["hairstyles"]
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!result.hairstyles || !Array.isArray(result.hairstyles)) {
        throw new Error("AI response did not contain valid hairstyle suggestions.");
    }

    return result.hairstyles;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get hairstyle suggestions from the AI. Please try again.");
  }
}


export async function generateHairstyleImage(
  imageDataUrl: string,
  hairstyle: Hairstyle
): Promise<string> {
  const [metadata, base64Data] = imageDataUrl.split(',');
  if (!base64Data) {
    throw new Error("Invalid image data URL for image generation");
  }

  const mimeType = metadata.match(/:(.*?);/)?.[1];
  if (!mimeType) {
    throw new Error("Could not determine MIME type from image data URL for image generation");
  }

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };

  const prompt = `Based on the provided image of a person, realistically edit their hairstyle to be a "${hairstyle.name}". 
  Hairstyle description: "${hairstyle.description}".
  Ensure the final image is high quality and that the person's face, expression, and the background remain unchanged. Only alter the hair.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          imagePart,
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      const base64ImageBytes = firstPart.inlineData.data;
      const generatedMimeType = firstPart.inlineData.mimeType || 'image/png';
      return `data:${generatedMimeType};base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated by the AI.");
    }
  } catch (error) {
    console.error("Error calling Gemini Image API:", error);
    throw new Error(`Failed to generate image for hairstyle: ${hairstyle.name}.`);
  }
}