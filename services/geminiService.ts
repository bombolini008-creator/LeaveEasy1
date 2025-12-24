
import { GoogleGenAI } from "@google/genai";
import { VACATION_POLICY_STRING, TEAM_AVAILABILITY_GUIDELINES } from "../constants";
import { UserStats, VacationRequest, LeaveType } from "../types";

export const askGemini = async (
  prompt: string,
  stats: UserStats,
  requests: VacationRequest[],
  leaveTypes: LeaveType[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const leaveTypesInfo = leaveTypes.map(lt => 
    `- ${lt.name} (${lt.icon}): ${lt.isDeductible ? 'Deducts from annual allowance' : 'Gifted / Extra leave'}`
  ).join('\n');

  const contextPrompt = `
    You are an HR Planning Assistant for Vacationly. Your goal is to help employees maximize their time off while adhering to company policy and team needs.
    
    Company Vacation Policy: 
    ${VACATION_POLICY_STRING}

    Available Leave Types in this Organization:
    ${leaveTypesInfo}
    
    Team Availability & Constraints:
    ${TEAM_AVAILABILITY_GUIDELINES}
    
    Current User Data:
    - Total Vacation Allowance: ${stats.total} days
    - Used Days (Deductible): ${stats.used} days
    - Available Days: ${stats.total - stats.used} days
    - Pending Requests: ${stats.pending} days
    
    Previous Requests History:
    ${JSON.stringify(requests)}

    Strategic Planning Instructions:
    1. If the user asks for suggestions, look for gaps in the team schedule.
    2. Check if they have many days left and suggest they take leave so as not to lose it, as there are no carry-over rules.
    3. Suggest "Long Weekends" using public holidays.
    4. Note the specific Leave Types available. For example, if they ask about "Sick Leave", explain if it deducts from their balance or not based on the provided list.
    
    User Query: ${prompt}
    
    Please provide helpful, friendly, and actionable advice. Use bullet points for date suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contextPrompt,
    });
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: Unable to connect to the AI assistant. Please check your API key.";
  }
};
