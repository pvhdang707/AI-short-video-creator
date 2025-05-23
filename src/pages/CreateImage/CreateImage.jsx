import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ImageGen from "./ImageGen";

const CreateImage = () => {
  const [activeTab, setActiveTab] = useState("video");
  const navigate = useNavigate();
  const location = useLocation();

  // Thêm useEffect để đồng bộ URL với activeTab
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path === 'image-generation') {
      setActiveTab('image-generation');
    }
  }, [location]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/create-image/${tab}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className=" mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-sm">
        {/* Header với các tab */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabClick("image-generation")}
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "image-generation"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Image Generation
          </button>
         
          
        </div>

        {/* Render component tương ứng với tab đang active */}
        {activeTab === "image-generation" && <ImageGen />}
        
        {/* Thêm các component khác cho text và subject */}
      </div>
    </div>
  );
};

export default CreateImage;