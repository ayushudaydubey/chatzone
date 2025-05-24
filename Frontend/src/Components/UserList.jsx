import React from 'react';

const UserList = ({ users, toUser, setToUser, formatTime }) => {
  return (
    <div className="col-span-1 border-r border-gray-200 p-4 bg-black">
      <h2 className="text-xl font-semibold text-white mb-4">
        All Users ({users.length})
      </h2>
      <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-2">
        {users.length === 0 ? (
          <p className="text-sm text-white">No users found</p>
        ) : (
          users.map((user) => {
            const userName = typeof user === 'object' ? user.username : user;
            const isOnline = typeof user === 'object' ? user.isOnline : true;

            return (
              <div
                key={userName}
                onClick={() => setToUser(userName)}
                className={`cursor-pointer px-4 py-3 rounded-md flex items-center gap-3 text-white capitalize bg-zinc-800 hover:bg-zinc-700 transition-all ${toUser === userName ? 'bg-blue-600 font-semibold' : ''
                  }`}
              >
                <span
                  className={`h-[12px] w-[12px] rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                ></span>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-gray-400">
                    {isOnline ? (
                      `Online • ${formatTime(Date.now())}`
                    ) : (
                      'Offline • Available for messages'
                    )}
                  </span>
                </div>
                {!isOnline && (
                  <div className="text-xs text-blue-400">💬</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-green-500"></span>
            <span>Online - Real-time chat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full bg-gray-500"></span>
            <span>Offline - Message delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
