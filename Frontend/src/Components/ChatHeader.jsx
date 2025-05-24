import React from 'react';

const ChatHeader = ({ toUser, users }) => {
  const userObj = users.find(u => (typeof u === 'object' ? u.username : u) === toUser);
  const isOnline = userObj && typeof userObj === 'object' ? userObj.isOnline : true;

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-zinc-950">
      <h1 className="text-xl font-semibold text-white">
        Chat with <span className="text-green-300 capitalize">{toUser || '...'}</span>
      </h1>
      {toUser && (
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`h-[8px] w-[8px] rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
          ></span>
          <p className="text-sm text-gray-400">
            {isOnline ? 'Online now' : 'Offline - Messages will be delivered when online'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
