
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchTrack } from "@/lib/api";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Initialize the API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function getAIRecommendations(
    recentTracks: SearchTrack[],
    limit: number = 5
): Promise<string[]> {
    if (!GEMINI_API_KEY) {
        console.warn("VITE_GEMINI_API_KEY is missing. Falling back to basic search.");
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const trackList = recentTracks
            .slice(-5) // Get up to last 5 tracks
            .map((t) => `${t.attributes.name} by ${t.attributes.artistName}`)
            .join(", ");

        const prompt = `
      As an expert DJ, suggest ${limit} songs that would perfectly follow this playlist to maintain the vibe and flow:
      ${trackList}

      Rules:
      1. Return ONLY a raw JSON array of strings in "Artist - Song Title" format.
      2. Do NOT include any markdown formatting (like \`\`\`json).
      3. Do NOT suggest songs already in the list.
      4. Suggest a mix of popular and hidden gems.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown if the model disobeys
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const suggestions: string[] = JSON.parse(cleanText);
        return suggestions;
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return [];
    }
}
