
import { GoogleGenAI, Type } from "@google/genai";
import { PublicHoliday } from "../types";

export const syncEgyptianHolidays = async (year: number): Promise<PublicHoliday[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    List all official public holidays in Egypt for the year ${year}. 
    Include both fixed date holidays (like Coptic Christmas, Revolution Day) and floating lunar holidays (like Eid al-Fitr, Eid al-Adha, Islamic New Year, Prophet's Birthday).
    For lunar holidays, provide the most accurate estimated Gregorian dates for Egypt in ${year}.
    Return the data as a JSON array of objects with 'name' and 'date' (YYYY-MM-DD) properties.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              date: { type: Type.STRING, description: "Format: YYYY-MM-DD" },
            },
            required: ["name", "date"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const holidays = JSON.parse(text);
    return holidays.map((h: any, index: number) => ({
      ...h,
      id: `sync-${year}-${index}-${Date.now()}`
    }));
  } catch (error) {
    console.error("Holiday Sync Error:", error);
    throw new Error("Failed to sync Egyptian holidays. Please check your connection.");
  }
};
