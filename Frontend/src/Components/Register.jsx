import React, { useContext } from 'react'
import { chatContext } from '../Context/Context'

const Register = () => {
  const { isRegistered, setUsername, username, handleRegister, toggler, settoggler } = useContext(chatContext)


  if (isRegistered) return null

  return (
    <div className="backdrop-blur-xl bg-white/10 p-8 rounded-xl w-96 text-center border border-blue-200 shadow-lg">
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Welcome...</h1>
      <p className="text-md text-zinc-100 mb-4">Enter your name to join the chat</p>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit"
          className="w-full bg-zinc-600 text-white font-semibold py-2 rounded-md hover:bg-zinc-700 transition"
        >
          Join Chat
        </button>

      </form>
    </div>
  )
}

export default Register
