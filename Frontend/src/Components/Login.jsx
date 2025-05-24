import React, { useState, useContext } from 'react';
import { chatContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const Login = () => {
  const { setUsername, setIsRegistered } = useContext(chatContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/login", {
        email,
        password,
      });

      if (res.status === 200) {
        setUsername(res.data.user.name);
        setIsRegistered(true);

        // Save token and user info
        localStorage.setItem("username", res.data.user.name); // ✅ match with Context.js

        // localStorage.setItem("chat-token", res.data.token); // Optional

        console.log("Login successful, cookies set");
        navigate("/chat");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 403) {
        // Already logged in from another device or session
        alert(error.response.data.message);
      } else if (error.response?.status === 401) {
        alert("Invalid credentials");
      } else if (error.response?.status === 404) {
        alert("User not found");
      } else {
        alert(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 p-8 rounded-xl w-96 text-center border border-blue-200 shadow-lg mx-auto mt-20">
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Enter your Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 text-blue-100 bg-zinc-800 border border-gray-300 rounded-md mb-4 outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-600 text-white font-semibold py-2 rounded-md hover:bg-zinc-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-zinc-300 mt-4">
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default Login;
