import React, { useContext, useState } from 'react';
import { chatContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
// Import your custom axios instance instead of regular axios
import axiosInstance from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const { isRegistered, handleRegister } = useContext(chatContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Using axiosInstance - cookies will be set automatically
      const res = await axiosInstance.post("/user/register", formData);
      
      if (res.status === 201) {
        alert("Registration successful! Please login.");
        // Clear form
        setFormData({
          name: '',
          mobileNo: '',
          email: '',
          password: ''
        });
        // Direct navigation
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response?.status === 400) {
        alert(error.response.data.error || "User already exists");
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Alternative method: Direct registration with auto-login
  const onSubmitWithAutoLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const success = await handleRegister(formData);
      if (success) {
        alert("Registration successful!");
        navigate("/chat"); // Direct to chat after registration
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) return null;

  return (
    <div className="backdrop-blur-xl bg-white/10 p-8 rounded-xl w-96 text-center border border-blue-200 shadow-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Welcome...</h1>
      <p className="text-md text-zinc-100 mb-4">Create your account to join the chat</p>

      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="Enter your name *" 
          value={formData.name} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
          required
        />
        
        <input 
          type="text" 
          name="mobileNo" 
          placeholder="Mobile number (optional)" 
          value={formData.mobileNo} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email ID *" 
          value={formData.email} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
          required
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Create Password (min 6 chars) *" 
          value={formData.password} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
          minLength="6"
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-600 text-white font-semibold py-2 rounded-md hover:bg-zinc-700 transition disabled:opacity-50 mb-3"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-zinc-300">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
};

export default Register;