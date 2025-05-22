import mongoose from 'mongoose'

const messageSchema  = new mongoose.Schema({
  senderId:{
    type:String,
    require:true
  },
    receiverId:{
    type:String,
    require:true
  },
    message:{
    type:String,
    require:true
  },
  timeStamp:{
    type:Date,
    default:Date.now()
  }
})

const messageModel  = mongoose.model('message',messageSchema)

export default messageModel