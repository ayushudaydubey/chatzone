import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { chatContext } from '../Context/Context';

const Private = ({ children }) => {
  const { isRegistered, isLoading } = useContext(chatContext);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full  h-screen bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isRegistered) {
    return <Navigate to="/login" replace />;
  }
  
  // Render protected component if authenticated
  return children;
};

export default Private;