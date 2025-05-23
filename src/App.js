import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LogInPage from './pages/Login/Login';
import CreateVideoPage from './pages/CreateVideo/CreateVideo';
import Sidebar from './components/Sidebar/Sidebar';
import Explore from './pages/Explore/Explore';
import Gallery from './pages/Gallery/Gallery';
// import CreateImage from './pages/CreateImage/CreateImage';
import SignUpPage from './pages/SignUp/SignUp';
import ItemDetail from './pages/ItemDetail/ItemDetail';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<MainLayout><Explore /></MainLayout>} />
        <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
        <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
        <Route path="/create-video/*" element={<MainLayout><CreateVideoPage /></MainLayout>} />
        {/* <Route path="/create-image/*" element={<MainLayout><CreateImage /></MainLayout>} /> */}
        <Route path="/item/:id" element={<ItemDetail />} />
      </Routes>
    </Router>
  );
};

export default App;