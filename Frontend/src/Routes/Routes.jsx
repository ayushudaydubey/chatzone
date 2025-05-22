// Routes/Routes.js
import React from 'react';
import { Route, Routes as AppRoutes } from 'react-router-dom';
import Register from '../Components/Register';
import ChatPage from '../Components/ChatPage';
import Home from '../Components/Home';
import Login from '../Components/Login';

const Routes = () => {
  return (
    <AppRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<ChatPage />} />
    </AppRoutes>
  );
};

export default Routes;
