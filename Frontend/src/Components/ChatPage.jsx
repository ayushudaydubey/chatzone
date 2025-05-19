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
    <div className="w-full max-w-8xl h-[100vh] backdrop-blur-3xl shadow-lg rounded-xl grid grid-cols-4 overflow-y">
      <div className="col-span-1 border-r border-gray-200 p-4 bg-black">
        <h2 className="text-xl font-semibold text-white mb-4">Online Users</h2>
        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-2">
          {registeredUsers.length === 0 && (
            <p className="text-sm text-white">No users online</p>
          )}
          {registeredUsers.map((user) => (
            <div
              key={user}
              onClick={() => setToUser(user)}
              className={`cursor-pointer px-6 py-2 rounded-md flex items-center gap-8 text-white capitalize bg-zinc-800 hover:bg-zinc-700 ${
                toUser === user ? 'bg-blue-200 font-semibold text-black' : ''
              }`}
            >
              <span className="h-[1px] w-[1px] p-1 rounded-3xl bg-green-500"></span>
              {user}
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-3 flex flex-col relative overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-zinc-950">
          <h1 className="text-xl font-semibold text-white">
            Chat with <span className="text-green-300 capitalize">{toUser || '...'}</span>
          </h1>
        </div>

        <div className="flex-1 px-6 py-4 space-y-3 pb-26 overflow-y-scroll bg-zinc-950">
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
                    : 'bg-zinc-800 text-white'
                }`}
              >
                <span className="font-thin">
                  <span className="capitalize">{m.fromUser}</span>:{' '}
                </span>
                {m.message}
              </div>
            ))}
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-center p-4 border-t border-gray-200 bg-black absolute bottom-0 left-0 right-0"
        >
          <input
            type="text"
            className="flex-1 p-3 text-blue-100 border border-gray-300 rounded-md focus:outline-none bg-zinc-800"
            placeholder={toUser ? `Type a message to ${toUser}` : 'Select a user to chat'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!toUser}
          />
          <button
            type="submit"
            disabled={!toUser}
            className="ml-4 bg-green-700 text-blue-50 px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
