import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log('Sending registration data:', formData);
      
      const response = await axiosInstance.post("/user/register", formData);
      
      console.log('Registration response:', response);
      
      // Success
      alert("Registration successful!");
      
      // Clear form
      setFormData({
        name: '',
        mobileNo: '',
        email: '',
        password: ''
      });
      
      // Go to login page
      navigate("/login");
      
    } catch (error) {
      console.error("Registration failed:", error);
      
      // Show error message
      if (error.response && error.response.data) {
        alert(error.response.data.message || error.response.data.error || "Registration failed");
      } else if (error.message) {
        alert("Error: " + error.message);
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 p-8 rounded-xl w-96 text-center border border-blue-200 shadow-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Create Account</h1>
      <p className="text-md text-zinc-100 mb-4">Join the chat</p>

      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="Your Name *" 
          value={formData.name} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
          required
        />
        
        <input 
          type="text" 
          name="mobileNo" 
          placeholder="Mobile Number (optional)" 
          value={formData.mobileNo} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email Address *" 
          value={formData.email} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
          required
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password (min 6 chars) *" 
          value={formData.password} 
          onChange={handleChange} 
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none" 
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 mb-3"
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