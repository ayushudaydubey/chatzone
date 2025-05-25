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
  }
})

const messageModel = mongoose.model('message', messageSchema)

export default messageModel