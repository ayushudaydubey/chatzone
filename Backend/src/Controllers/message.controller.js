import messageModel from "../Models/chat.models.js";

// Controller to store new message
export async function messageController(req, res) {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMessage = await messageModel.create({
      senderId,
      receiverId,
      message
    });

    res.status(200).json({
      message: 'success',
      newMessage
    });
  } catch (error) {
     res.status(500).json({ message: "Failed to store message", error: error.message });
  }
}

// Controller to get message history between two users
export async function getMessagesController(req, res) {
  try {
    // Handle both query params (for GET requests) and route params (for alternative implementation)
    const senderId = req.query.senderId || req.params.senderId;
    const receiverId = req.query.receiverId || req.params.receiverId;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "senderId and receiverId are required" });
    }
    
    // Find messages where either:
    // 1. senderId is sender and receiverId is receiver, OR
    // 2. senderId is receiver and receiverId is sender
    const messages = await messageModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timeStamp: 1 }); // Sort by timestamp ascending
    
    res.status(200).json(messages);
  } catch (error) {
  
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
}

// ai mseesge save controller // Backend mein AI response save karna
export async function aiMessageSaveController(req, res) {
  try {
    const { message, chatHistory, senderId } = req.body;
    
    // User message save karo
    await saveMessage({
      fromUser: senderId,
      toUser: 'Elva (Ai)',
      message: message,
      timestamp: new Date()
    });
    
    // AI response generate karo
    const aiResponse = await getAIResponse(message, chatHistory);
    
    // AI response save karo
    await saveMessage({
      fromUser: 'Elva (Ai)',
      toUser: senderId,
      message: aiResponse,
      timestamp: new Date(),
       isRead: false 
    });
    
    res.json({ success: true, response: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

