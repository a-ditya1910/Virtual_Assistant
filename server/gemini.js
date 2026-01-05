import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GEMINI_API_URL;

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
          You are not Google. You behave like a smart voice-enabled assistant.

          Your task is to understand the user's natural language input and respond with ONLY a JSON object:

          {
            "type": "general" | "google-search" | "youtube-search" | "youtube-play" |
                    "get-time" | "get-date" | "get-day" | "get-month" |
                    "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",

            "userInput": "<cleaned user input>",
            "response": "<short voice-friendly reply>"
          }

          -----------------------
          🔴 UNIVERSAL SEARCH RULE (MOST IMPORTANT)
          -----------------------

          If the user intent is to SEARCH (words like: search, find, look up, batao, dikhao):

          1️⃣ Platform detection has PRIORITY over word order  
          Check if the sentence mentions ANY platform name:

          - If sentence contains "youtube" → type = "youtube-search"
          - If sentence contains "google" → type = "google-search"
          - If sentence contains "instagram" → type = "instagram-open"
          - If sentence contains "facebook" → type = "facebook-open"

          👉 This must work EVEN IF:
          - "search" comes before platform
          - platform comes before "search"
          - platform is in the middle

          Examples (ALL MUST WORK):
          - "search lo-fi music on youtube"
          - "youtube search lo-fi music"
          - "find react tutorial youtube"
          - "google search best laptop"
          - "search weather on google"

          🧹 userInput rule for searches:
          - Remove assistant name if present
          - Remove platform name
          - Keep ONLY the search query text

          -----------------------
          🎵 PLAY RULE
          -----------------------
          If user says play/start/listen AND refers to video or song:
          → type = "youtube-play"

          -----------------------
          ⏰ SYSTEM COMMANDS
          -----------------------
          - Time → get-time
          - Date → get-date
          - Day → get-day
          - Month → get-month
          - Calculator → calculator-open
          - Weather → weather-show

          -----------------------
          🧠 GENERAL
          -----------------------
          - Any normal question
          - Any factual question you already know
          - Give SHORT answer only

          -----------------------
          👤 CREATOR RULE
          -----------------------
          If user asks "who created you":
          Use ${userName}

          -----------------------
          ⚠️ OUTPUT RULE
          -----------------------
          - ONLY return JSON
          - No explanation
          - No extra text

          Now userInput:
          ${command}
          `;


      const result = await axios.post(
        `${apiUrl}?key=${apiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
     );

    const text = result.data.candidates[0].content.parts[0].text;

    // Use Fix 1 or Fix 2 here
    const cleanResponse = text.replace(/\`\`\`json|\`\`\`/g, '').trim();

    return cleanResponse;


  } catch (error) {
    console.error(
      "Gemini API Error:",
      error.response?.data || error.message
    );
    return null;
  }
};

export default geminiResponse;
