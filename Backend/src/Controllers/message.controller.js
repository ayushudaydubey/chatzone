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
    console.error("Error storing message:", error);
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
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
}