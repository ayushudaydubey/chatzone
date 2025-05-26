import React, { useState, useContext } from 'react';
import { chatContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import loginGirl from '../assets/boyregi.jpg';

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
        localStorage.setItem("username", res.data.user.name);
        navigate("/chat");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 403) {
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
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-stone-950">
      {/* Image Section - hidden on small screens */}
      <div className="w-full md:w-1/2 h-full md:h-screen">
        <img
          src={loginGirl}
          alt="login"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 px-6 py-10 flex flex-col items-center justify-center">
        <h1 className="text-xl text-zinc-300 mb-2">Welcome back!</h1>
        <h2 className="text-3xl font-bold text-blue-200 mb-4 text-center">
          Login to ChatZone
        </h2>
        <p className="text-center text-zinc-400 mb-6 px-2">
          Connect instantly with your friends, share moments, and chat without limits. <br />
          Secure. Fast. Effortless.
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <input
            type="email"
            name="email"
            placeholder="Enter your Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 text-blue-200 bg-zinc-800 border border-blue-200 rounded-md mb-4 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 text-blue-200 bg-zinc-800 border border-blue-200 rounded-md mb-4 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-2 border-2 border-blue-200 hover:border-blue-400 hover:text-black rounded-md hover:bg-blue-400 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-zinc-300 mt-4 text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Register here
          </button>
        </p>

        <p className="text-xs text-zinc-500 mt-2 text-center">
           Your login is protected with end-to-end encryption.
        </p>
      </div>
    </div>
  );
};

export default Login;
