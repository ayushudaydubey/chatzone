import React from 'react'
import { BrowserRouter as AppRouter, Route, Routes as AppRoutes } from 'react-router-dom'
import Register from '../Components/Register'
import ChatPage from '../Components/ChatPage'
import Home from '../Components/Home'



const Routes = () => {
  return (
    <AppRouter>
      <AppRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path='/chat' element={<ChatPage />} />
      </AppRoutes>
    </AppRouter>
  )
}

export default Routes
