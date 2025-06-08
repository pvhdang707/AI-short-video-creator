import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import LogInPage from './pages/Login/Login';
import CreateVideoPage from './pages/CreateVideo/CreateVideo';
import Sidebar from './components/Sidebar/Sidebar';
import Explore from './pages/Explore/Explore';
import Gallery from './pages/Gallery/Gallery';
// import CreateImage from './pages/CreateImage/CreateImage';
import SignUpPage from './pages/SignUp/SignUp';
import ItemDetail from './pages/ItemDetail/ItemDetail';
import CreateVideoV2 from './pages/CreateVideo/V2';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
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
          <Route path="/" element={<MainLayout><Explore /></MainLayout>} />
          <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
          <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
          <Route path="/create-video/*" element={<MainLayout><CreateVideoPage /></MainLayout>} />
          <Route path="/create-video-v2" element={<MainLayout><CreateVideoV2 /></MainLayout>} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout><Gallery /></MainLayout>
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
      </Router>
    </AuthProvider>
  );
};

export default App;