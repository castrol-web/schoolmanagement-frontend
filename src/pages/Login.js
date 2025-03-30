import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { URL } from '../App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // <-- Loading state
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // Show loading
    try {
      const response = await axios.post(`${URL}/api/users/login`, { email, password });
      const token = response.data.token;

      if (token) {
        const decoded = jwtDecode(token);
        const role = decoded.role;
        localStorage.setItem('token', token);

        if (role === 'admin') {
          navigate("/admin/dashboard");
        } else if (role === 'teacher') {
          navigate("/teacher/dashboard");
        } else if (role === 'parent') {
          navigate('/parent/dashboard');
        }
        toast.success('Login successful!');
      } else {
        toast.error('Login failed, no token received');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error logging in:', error);
    } finally {
      setLoading(false); // Hide loading
    }
  };

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  });

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <animated.div style={fadeIn} className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back!</h1>
          <form className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Disable input while loading
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // Disable input while loading
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <span className="loading loading-spinner"></span> // Show spinner
              ) : (
                "Login"
              )}
            </button>
          </form>
          <p className="text-sm text-center text-gray-500 mt-4">
            Forgot Password?{' '}
            <a href="/reset" className="text-blue-600 underline">Reset here</a>
          </p>
        </animated.div>
      </div>
    </>
  );
};

export default Login;
