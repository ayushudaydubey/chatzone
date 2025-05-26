import React from 'react';
import { X, MessageCircle } from 'lucide-react';

const UserList = ({ 
  users, 
  toUser, 
  setToUser, 
  username, 
  formatTime, 
  isRegistered, 
  isOpen, 
  onClose,
  getUnreadCount,
  getLastMessage,
  getTotalUnreadCount 
}) => {
  console.log("username---->", username);
  const allUsers = users || [];
  const totalUnread = getTotalUnreadCount ? getTotalUnreadCount() : 0;

  // Helper function to truncate message text
  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Helper function to format timestamp for last message
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile Overlay Background */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />

      {/* User List Container */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-72 sm:w-80 md:w-96 lg:w-full bg-zinc-900 border-r border-gray-700 z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700 bg-zinc-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-lg">Users</h2>
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {allUsers.length}
            </span>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                {totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Close user list"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-4 border-b border-gray-700 bg-zinc-900 flex-shrink-0">
          <div className="">
            <h1 className='text-2xl font-normal text-white mb-4'>Welcome... <span className='text-blue-200 capitalize font-semibold'> {username} </span></h1> 
            <div className='flex gap-4 items-center'>
              <h2 className="text-white font-semibold text-lg">All Registered Users</h2>
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                {allUsers.length}
              </span>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                  {totalUnread} new
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current User Section - Shows on Mobile */}
        <div className="lg:hidden p-4 border-b border-gray-700 bg-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800 shadow-green-500/50 shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium capitalize truncate text-sm">
                {username} (You)
              </p>
              <p className="text-green-400 text-xs font-medium">Online</p>
            </div>
          </div>
        </div>

        {/* Users List - Scrollable Container with Fixed Positioning */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            <div className="min-h-full">
              {/* Other Users */}
              {allUsers.map((user, index) => {
                const userObj = typeof user === 'object' ? user : { username: user, isOnline: true };
                const { username: userName, isOnline } = userObj;
                const unreadCount = getUnreadCount ? getUnreadCount(userName) : 0;
                const lastMessage = getLastMessage ? getLastMessage(userName) : null;

                return (
                  <div
                    key={`${userName}-${index}`}
                    onClick={() => {
                      setToUser(userName);
                      onClose();
                    }}
                    className={`relative flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-gray-800 hover:border-gray-700
                      ${toUser === userName 
                        ? 'bg-green-800/30 border-green-700/50 shadow-lg' 
                        : unreadCount > 0
                        ? 'bg-blue-900/20 hover:bg-blue-800/30'
                        : 'hover:bg-gray-800/60'
                      }
                    `}
                  >
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {userName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      {/* Online/Offline Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                        isOnline 
                          ? 'bg-green-500 shadow-green-500/50 shadow-sm' 
                          : 'bg-gray-500 shadow-gray-500/50 shadow-sm'
                      }`} />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium capitalize truncate text-sm sm:text-base">
                          {userName || 'Unknown User'}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatLastMessageTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {/* Last Message Preview */}
                      {lastMessage ? (
                        <div className="flex items-center gap-1">
                          {lastMessage.isFile ? (
                            <>
                              <span className="text-xs">📎</span>
                              <p className="text-xs text-gray-400 truncate">
                                Sent a file
                              </p>
                            </>
                          ) : (
                            <p className={`text-xs truncate ${unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                              {truncateMessage(lastMessage.message)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className={`text-xs sm:text-sm font-medium ${
                          isOnline ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </p>
                      )}
                    </div>

                    {/* Message Indicators */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {/* Unread Message Count */}
                      {unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                      
                   
                      
                      {/* New Message Icon */}
                      {unreadCount > 0 && toUser !== userName && (
                        <MessageCircle size={14} className="text-blue-400 animate-pulse" />
                      )}
                    </div>

                    {/* New Message Pulse Effect */}
                    {unreadCount > 0 && toUser !== userName && (
                      <div className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse pointer-events-none opacity-30"></div>
                    )}
                  </div>
                );
              })}

              {/* No Users */}
              {allUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[200px]">
                  <div className="text-gray-500 text-4xl mb-4">👥</div>
                  <p className="text-gray-400 text-sm mb-2 font-medium">No users available</p>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-48">
                    Other registered users will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Scrollbar Styles */}
         
        </div>
      </div>
    </>
  );
};

export default UserList;