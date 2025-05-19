import React, { useContext, useState } from 'react';
import { chatContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'


const Register = () => {
  const navigate =  useNavigate()
  const { isRegistered, handleRegister } = useContext(chatContext);

  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(formData);
     navigate("/chat");  
  };

  if (isRegistered) return null;

  

  return (
    <div className="backdrop-blur-xl bg-white/10 p-8 rounded-xl w-96 text-center border border-blue-200 shadow-lg">
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Welcome...</h1>
      <p className="text-md text-zinc-100 mb-4">Enter your name to join the chat</p>

      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" />
        <input type="text" name="mobileNo" placeholder="Mobile number" value={formData.mobileNo} onChange={handleChange} className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" />
        <input type="email" name="email" placeholder="Email Id" value={formData.email} onChange={handleChange} className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" />
        <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" />
        
        <button type="submit" className="w-full bg-zinc-600 text-white font-semibold py-2 rounded-md hover:bg-zinc-700 transition">
           Join Chat
        </button>
      </form>
    </div>
  );
};

export default Register;