const { generateAIResponse } = require("../services/openai.service")

// Simple in-memory usage limit (later replace with DB)
const usage = {}

const getUserId = (req) => {
    const { userId } = req.body
    if (userId) return userId
//   return req.headers["x-user-id"] || req.ip
}

const aiController = async (req, res) => {
  try {
    const userId = getUserId(req)
    usage[userId] = (usage[userId] || 0) + 1

    if (usage[userId] > 200) {
      return res.status(429).json({
        error: "You have exceeded your AI usage limit"
      })
    }

    const { action, text, promptExtra, model } = req.body

    if (!text && !promptExtra) {
      return res.status(400).json({ error: "Text or prompt is required" })
    }

    const output = await generateAIResponse({
      action,
      text,
      promptExtra,
      model
    })

    return res.json({
      success: true,
      output
    })
  } catch (error) {
    console.error("AI Error:", error)
    return res.status(500).json({
      success: false,
      error: "AI generation failed"
    })
  }
}

module.exports = {
  aiController
}
