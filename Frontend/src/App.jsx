import React, { useContext } from 'react'
import Register from './Components/Register'
import ChatPage from './Components/ChatPage'
import { chatContext } from './Context/Context'
import AppRoutes from './Routes/Routes'


const App = () => {
  const { isRegistered, toggler } = useContext(chatContext)

  return (
    <div className="min-h-screen bg-[url(https://images.unsplash.com/photo-1635699155506-93541532e87f?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] bg-cover bg-center flex items-center justify-center">
       <AppRoutes/>
     
    </div>
  )
}

export default App
