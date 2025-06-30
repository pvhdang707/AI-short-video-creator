import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const isProcessing = useRef(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Kiểm tra nếu đã xử lý thành công trước đó
      if (hasProcessed.current) {
        console.log('Already processed successfully, redirecting...');
        navigate('/explore', { replace: true });
        return;
      }

      // Tránh xử lý nhiều lần
      if (isProcessing.current) {
        console.log('Already processing callback');
        return;
      }
      isProcessing.current = true;

      try {
        // Lấy code từ URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          console.error('No code found in URL');
          throw new Error('Authentication code not found');
        }

        console.log('Processing Google callback with code:', code);

        // Gọi API callback
        const response = await authAPI.googleCallback(code);
        console.log('Backend response:', response);

        if (!response.data || !response.data.access_token) {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response from server');
        }

        const { access_token, refresh_token } = response.data;

        // Đăng nhập với token
        console.log('Logging in with tokens...');
        const userData = await loginWithToken({ access_token, refresh_token });
        console.log('Login successful, user data:', userData);

        // Kiểm tra xem token đã được lưu chưa
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
          console.error('Token was not saved properly');
          throw new Error('Error saving login information');
        }

        // Đánh dấu đã xử lý thành công
        hasProcessed.current = true;

        // Chuyển hướng đến trang explore
        toast.success('Google login successful!');
        navigate('/explore', { replace: true });
      } catch (error) {
        console.error('Google callback error:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Google login failed!';
        toast.error(errorMessage);
        
        // Log thêm thông tin lỗi
        if (error.response) {
          console.error('Error response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        }
        
        navigate('/login', { replace: true });
      } finally {
        isProcessing.current = false;
      }
    };

    handleCallback();
  }, [location, loginWithToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing login...</h2>
        <p className="text-gray-600">Please wait a moment</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
