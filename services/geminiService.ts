import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TargetLanguage, TranslationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

export async function translateText(text: string, language: TargetLanguage): Promise<TranslationResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following English word or phrase: "${text}" into ${language}. 
      Target audience: A young child (5-10 years old).
      Return a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING, description: "The translated word or phrase." },
            phonetic: { type: Type.STRING, description: "A simplified phonetic pronunciation guide for a child (e.g., 'Oh-lah' for Hola)." },
            pronunciationNote: { type: Type.STRING, description: "A helpful pronunciation tip for a child. Use comparisons, rhymes, or sound-alikes to explain how to say it (e.g. 'Rhymes with see-now' or 'Start like apple...')." },
            emoji: { type: Type.STRING, description: "A single relevant emoji representing the word." },
            funFact: { type: Type.STRING, description: "A very short, fun example sentence or fact about this word in English (max 10 words)." },
          },
          required: ["translatedText", "phonetic", "pronunciationNote", "emoji", "funFact"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const result = JSON.parse(jsonText) as Omit<TranslationResult, 'original'>;
    return {
      original: text,
      ...result
    };

  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

export async function generateSpeech(text: string, language: TargetLanguage): Promise<string> {
  try {
    // Choose voice based on language vibe if possible, otherwise default to a kid-friendly one
    const voiceName = 'Puck'; // Puck is energetic

    const prompt = `Say the following text clearly in ${language}: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: prompt,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error("No audio data received");
    }

    return audioData;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
}

export async function suggestWord(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me one random, simple, fun English word for a child to learn to translate (e.g., animals, food, colors, adventure objects). Just return the word.",
    });
    return response.text?.trim() || "Puppy";
  } catch (error) {
    return "Butterfly";
  }
}