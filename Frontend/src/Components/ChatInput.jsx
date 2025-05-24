import React from 'react';

const ChatInput = ({ handleSend, message, setMessage, toUser, users }) => {
  const userObj = users.find(u => (typeof u === 'object' ? u.username : u) === toUser);
  const isOnline = userObj && typeof userObj === 'object' ? userObj.isOnline : true;

  return (
    <form
      onSubmit={handleSend}
      className="flex items-center p-4 border-t border-gray-200 bg-black absolute bottom-0 left-0 right-0"
    >
      <input
        type="text"
        className="flex-1 p-3 text-blue-100 border border-gray-300 rounded-md focus:outline-none bg-zinc-800"
        placeholder={toUser ? `Message ${toUser} ${isOnline ? '(online)' : '(offline - will receive later)'}` : 'Select a user to chat'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={!toUser}
      />
      <button
        type="submit"
        disabled={!toUser || !message.trim()}
        className="ml-4 bg-green-700 text-blue-50 px-4 py-2 rounded-md hover:bg-green-600 transition"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
