import React, { useContext, useEffect } from 'react';
import { chatContext } from '../Context/Context';
import UserList from '../Components/UserList';
import ChatHeader from '../Components/ChatHeader';
import ChatMessages from '../Components/ChatMessages';
import ChatInput from '../Components/ChatInput';

const ChatPage = () => {
  const {
    users, setToUser, toUser, username,
    message, setMessage, handleSend, messages,
    setUsername, senderId, setSenderId, receiverId, setReceiverId,
    socket, messagesEndRef
  } = useContext(chatContext);

  useEffect(() => {
    setSenderId(username);
    setReceiverId(toUser);
  }, [toUser, username, setSenderId, setReceiverId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    else if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-8xl h-[100vh] backdrop-blur-3xl shadow-lg rounded-xl grid grid-cols-4 overflow-hidden">
      <UserList users={users} toUser={toUser} setToUser={setToUser} formatTime={formatTime} />
      <div className="col-span-3 flex flex-col relative overflow-hidden">
        <ChatHeader toUser={toUser} users={users} />
        <ChatMessages messages={messages} username={username} toUser={toUser} formatTime={formatTime} formatDate={formatDate} messagesEndRef={messagesEndRef} />
        <ChatInput handleSend={handleSend} message={message} setMessage={setMessage} toUser={toUser} users={users} />
      </div>
    </div>
  );
};

export default ChatPage;
