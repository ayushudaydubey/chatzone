import React, { useContext } from 'react'
import { chatContext } from '../Context/Context'

const ChatPage = () => {
  const {
    registeredUsers,
    setToUser,
    toUser,
    username,
    message,
    setMessage,
    handleSend,
    messages,
    
  } = useContext(chatContext)

  return (
    <div className="w-full max-w-7xl h-[100vh] backdrop-blur-xl shadow-lg rounded-xl grid grid-cols-4 overflow-hidden">
      <div className="col-span-1 border-r border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Online Users</h2>
        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-2">
          {registeredUsers.length === 0 && (
            <p className="text-sm text-white">No users online</p>
          )}
          {registeredUsers.map((user) => (
            <div
              key={user}
              onClick={() => setToUser(user)}
              className={`cursor-pointer p-2 rounded-md text-gray-700 hover:bg-blue-100 ${
                toUser === user ? 'bg-blue-200 font-semibold' : ''
              }`}
            >
              {user}
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-3 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-white">
            Chat with <span className="text-green-300">{toUser || '...'}</span>
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages
            .filter(
              (m) =>
                (m.fromUser === 'You' && m.toUser === toUser) ||
                (m.fromUser === toUser && m.toUser === username)
            )
            .map((m, i) => (
              <div
                key={i}
                className={`max-w-sm px-3 py-3 rounded-lg ${
                  m.fromUser === 'You'
                    ? 'bg-zinc-700 text-white self-end ml-auto'
                    : 'bg-zinc-800 text-gray-200'
                }`}
              >
                <span className="font-thin">{m.fromUser}: </span>
                {m.message}
              </div>
            ))}
        </div>
        <form
          onSubmit={handleSend}
          className="flex items-center p-4 border-t border-gray-200"
        >
          <input
            type="text"
            className="flex-1 p-3 text-blue-100 border border-gray-300 rounded-md focus:outline-none bg-zinc-800"
            placeholder={
              toUser ? `Type a message to ${toUser}` : 'Select a user to chat'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!toUser}
          />
          <button
            type="submit"
            disabled={!toUser}
            className="ml-4 bg-zinc-600 text-blue-100 px-4 py-2 rounded-md hover:bg-zinc-700 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
