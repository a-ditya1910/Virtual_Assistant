import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({ message: "get current user error" })
    }
}

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body
        let assistantImage;
        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path)
        } else {
            assistantImage = imageUrl
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
        }, { new: true }).select("-password")
        return res.status(200).json(user)


    } catch (error) {
        return res.status(400).json({ message: "updateAssistantError user error" })
    }
}


export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    // Validate user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ response: "User not found" });
    }

    // Save history
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    console.log("➡️ Sending to Gemini:", command);

    const result = await geminiResponse(command, assistantName, userName);
    console.log("⬅️ Gemini Raw Response:", result);

    if (!result || typeof result !== "string") {
      return res.status(500).json({ response: "AI service failed" });
    }

    // ✅ SAFE JSON PARSE
    let gemResult;
    try {
      gemResult = JSON.parse(result);
    } catch (err) {
      console.error("❌ JSON parse error:", result);
      return res.status(500).json({ response: "Invalid AI response format" });
    }

    const { type, userInput, response } = gemResult;

    switch (type) {
      // 1. OPENING WEBSITES
      case "google-open":
      case "youtube-open":
      case "instagram-open":
      case "facebook-open":
      case "calculator-open":
         // Frontend will detect these types and window.open(url)
         return res.json({ type, userInput, response });

      // 2. SEARCHING / PLAYING
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "weather-show":
         // Frontend will construct a search URL
         return res.json({ type, userInput, response });

      // 3. DATA & GENERAL
      case "get-date":
      case "get-time":
      case "get-day":
      case "get-month":
      case "general":
         return res.json({ type, userInput, response });
      
      default:
         return res.json({ type: "general", userInput: command, response: response });
    }
  } catch (error) {
    console.error("🔴 askToAssistant Error:", error);
    return res.status(500).json({ response: "ask assistant error" });
  }
};