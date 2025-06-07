import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv'

dotenv.config();
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Bot personality
const AI_BOT_PERSONALITY = `
You are a friendly AI assistant named "Elva Ai". You should:
- Be conversational and friendly like a good friend
- Give helpful, accurate responses
- Keep responses concise but informative
- Use a warm, supportive tone
- Occasionally use emojis to make conversations more engaging
- Remember you're chatting in a casual chat application
`;

// Route to handle AI chat
export async function aiChatController(req, res) {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation context
    let conversationContext = AI_BOT_PERSONALITY + "\n\nConversation:\n";

    // Get recent history (last 10 messages for context)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.fromUser !== 'Elva Ai') {
        conversationContext += `Human: ${msg.message}\n`;
      } else {
        conversationContext += `Elva Ai: ${msg.message}\n`;
      }
    });

    conversationContext += `Human: ${message}\nElva Ai: `;

    const result = await model.generateContent(conversationContext);
    const aiResponse = result.response.text();

    res.json({
      success: true,
      response: aiResponse.trim()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      details: error.message
    });
  }
}