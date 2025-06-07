// Update your message model (chat.models.js) to include isRead field

import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file'],
    default: 'text'
  },
  fileInfo: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    imageKitFileId: String
  },
  timeStamp: {
    type: Date,
    default: Date.now
  },
  // Add these new fields for read status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
})

// Add indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1, timeStamp: -1 })
messageSchema.index({ receiverId: 1, isRead: 1 })

const messageModel = mongoose.model('Message', messageSchema)

export default messageModel