import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import LogInPage from './pages/Login/Login';
import Sidebar from './components/Sidebar/Sidebar';
import Explore from './pages/Explore/Explore';
import Gallery from './pages/Gallery/Gallery';
// import CreateImage from './pages/CreateImage/CreateImage';
import SignUpPage from './pages/SignUp/SignUp';
import ItemDetail from './pages/ItemDetail/ItemDetail';
import CreateVideoV2 from './pages/CreateVideo/V2';
import GoogleCallback from './pages/Login/GoogleCallback';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Đang tải...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Lưu lại URL hiện tại để sau khi đăng nhập có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LogInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout><Explore /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <MainLayout><Explore /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <MainLayout><Gallery /></MainLayout>
              </ProtectedRoute>
            }
          />
         
          <Route
            path="/create-video"
            element={
              <ProtectedRoute>
                <MainLayout><CreateVideoV2 /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/item/:id"
            element={
              <ProtectedRoute>
                <ItemDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-detail/:scriptId"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/video-script"
            element={
              <ProtectedRoute>
                <MainLayout><VideoScript /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            }
          /> */}
        </Routes>
        
        {/* Toast Container với cấu hình tùy chỉnh */}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
          theme="dark"
          closeButton={true}
          limit={5}
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
          progressClassName="custom-toast-progress"
        />
      </Router>
    </AuthProvider>
  );
};

export default App;