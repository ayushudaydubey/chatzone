// App.js
import React, { useContext } from 'react';
import { chatContext } from './Context/Context'; 
import AppRoutes from './Routes/Routes';

const App = () => {
  const { isRegistered, toggler } = useContext(chatContext);

  return (
    <div className="min-h-screen bg-zinc-950 bg-cover bg-center flex items-center justify-center">
      <AppRoutes />
    </div>
  );
};

export default App;
