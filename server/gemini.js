import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GEMINI_API_URL;

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

     const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show" | "google-open" | "youtube-open" | "open-facebook" | "open-instagram" | "open-calculator" | "open-weather" | 
           "search-google" | "search-youtube" | "play-youtube",
  "userInput": "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,

  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
- "google-search": if user wants to search something on Google .
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to  open a calculator .
- "instagram-open": if user wants to  open instagram .
- "facebook-open": if user wants to open facebook.
-"weather-show": if user wants to know weather
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.
- "google-open": if user wants to open google homepage.
- "youtube-open": if user wants to open youtube homepage.
- "open-facebook": if user wants to open facebook homepage. 
  "search-google":if user wants to search something on Google .
- "search-youtube": if user wants to search something on YouTube.
- "play-youtube": if user wants to directly play a video or song. 


Important:
- Use ${userName} agar koi puche tume kisne banaya 
- Only respond with the JSON object, nothing else.


now your userInput- ${command}
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
