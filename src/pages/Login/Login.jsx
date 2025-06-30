import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLogin from '../../components/GoogleLogin';

const backgroundImageUrl = '/images/1.jpeg';

const LogInPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Please enter username';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Please enter password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log('Starting login with username:', formData.username);
    
    try {
      console.log('Gọi hàm login từ AuthContext');
      const userData = await login({
        username: formData.username,
        password: formData.password
      });
      console.log('Login successful, userData:', userData);
      
      toast.success('Login successful!');
      console.log('Redirecting to /explore');
      navigate('/explore');
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 401) {
        toast.error('Username or password is incorrect');
      } else if (error.response?.status === 422) {
        // Xử lý lỗi validation từ server
        const validationErrors = error.response?.data?.detail;
        if (Array.isArray(validationErrors)) {
          // Nếu server trả về danh sách lỗi
          validationErrors.forEach(err => {
            const field = err.loc[err.loc.length - 1];
            const message = err.msg;
            setErrors(prev => ({
              ...prev,
              [field]: message
            }));
            toast.error(message);
          });
        } else if (typeof validationErrors === 'object') {
          // Nếu server trả về object lỗi
          Object.entries(validationErrors).forEach(([field, messages]) => {
            setErrors(prev => ({
              ...prev,
              [field]: Array.isArray(messages) ? messages[0] : messages
            }));
            toast.error(Array.isArray(messages) ? messages[0] : messages);
          });
        } else {
          // Nếu server trả về message đơn giản
          toast.error(validationErrors || 'Invalid data');
        }
      } else if (error.response?.status === 429) {
        toast.error('Too many failed login attempts. Please try again later');
      } else if (!error.response) {
        toast.error('Unable to connect to server. Please check your network connection');
      } else {
        toast.error(error.response?.data?.detail || 'Login failed. Please try again!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Lấy URL đăng nhập Google từ backend
      const res = await authAPI.googleLoginUrl();
      const url = res.data.url;
      // Chuyển hướng sang Google
      window.location.href = url;
    } catch (error) {
      toast.error('Unable to connect Google Login');
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Phần background bên trái */}
      <div className="hidden lg:block lg:w-1/2 xl:w-2/3">
        <div 
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
          {/* Overlay để làm chữ dễ đọc hơn nếu cần */}
          <div className="h-full w-full bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-white px-12">
              <h1 className="text-4xl font-bold mb-4">AI Video Creator</h1>
              <p className="text-xl">Transform your ideas into stunning videos with AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phần form bên phải */}
      <div className="w-full lg:w-1/2 xl:w-1/3 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Short Video Creator</h1>
            <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ background: 'none', border: 'none' }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.664-2.336A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.664 2.336A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.664-2.336A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.664 2.336A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me checkbox */}
              <div className="flex items-center">
                <input
                id="rememberMe"
                name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
                </label>
            </div>

            {/* Sign in button */}
            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLogin />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;