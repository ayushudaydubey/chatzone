import React from 'react';

const ChatMessages = ({ messages, username, toUser, formatTime, formatDate, messagesEndRef }) => {
  return (
    <div className="flex-1 px-6 py-4 space-y-3 pb-28 overflow-y-auto bg-zinc-950">
      {messages
        .filter(
          (m) =>
            (m.fromUser === username && m.toUser === toUser) ||
            (m.fromUser === toUser && m.toUser === username)
        )
        .map((m, i) => {
          const messageTime = m.timestamp || m.timeStamp || Date.now();
          return (
            <div key={i} className="flex flex-col">
              {i === 0 || formatDate(messageTime) !== formatDate(messages[i - 1]?.timestamp || messages[i - 1]?.timeStamp || Date.now()) ? (
                <div className="text-center text-xs text-gray-500 my-2">
                  {formatDate(messageTime)}
                </div>
              ) : null}

              <div className={`max-w-sm px-3 py-3 rounded-lg ${m.fromUser === username
                ? 'bg-green-900 text-white self-end ml-auto'
                : 'bg-green-800 text-white'
                }`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-thin capitalize">{m.fromUser}:</span> {m.message}
                  </div>
                </div>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  {formatTime(messageTime)}
                </div>
              </div>
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
