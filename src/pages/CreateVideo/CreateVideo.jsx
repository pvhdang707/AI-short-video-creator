import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import ImageToVideo from "./ImageToVideo";
// import TextToVideo from "./TextToVideo";
import Step1_Script from "./ScriptGenerator";
import Step2_Voice from "./VoiceOverGenerator";
import Step3_Images from "./ImageGenerator";

// pages/CreateVideo/index.jsx
const CreateVideo = () => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    script: null,
    voice: null,
    images: null
  });

  const nextStep = (data) => {
    // Cập nhật dữ liệu tương ứng với từng bước
    if (step === 1) {
      setProjectData(prev => ({
        ...prev,
        script: data
      }));
    } else if (step === 2) {
      setProjectData(prev => ({
        ...prev,
        voice: data
      }));
    } else if (step === 3) {
      setProjectData(prev => ({
        ...prev,
        images: data
      }));
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container w-full h-full p-4 mx-auto">
        {step === 1 && (
          <Step1_Script 
            onNext={nextStep} 
            initialScript={projectData.script} 
          />
        )}
        {step === 2 && (
          <Step2_Voice 
            script={projectData.script} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {step === 3 && (
          <Step3_Images 
            script={projectData.script} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {/* Các bước tiếp theo */}
      </div>
    </div>
  );
};

export default CreateVideo;

// const CreateVideoPage = () => {
//   const [activeTab, setActiveTab] = useState("video");
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Thêm useEffect để đồng bộ URL với activeTab
//   useEffect(() => {
//     const path = location.pathname.split('/').pop();
//     if (path === 'text-to-video') {
//       setActiveTab('text-to-video');
//     // } else if (path === 'subject') {
//     //   setActiveTab('subject');
//     } else {
//       setActiveTab("image-to-video");
//     }
//   }, [location]);

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     navigate(`/create-video/${tab}`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
//       <div className="mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-sm">
//         {/* Header với các tab */}
//         <div className="flex border-b border-gray-200 mb-6">
//           <button
//             onClick={() => handleTabClick("image-to-video")}
//             className={`px-6 py-3 font-medium text-lg ${
//               activeTab === "image-to-video"
//                 ? "text-blue-600 border-b-2 border-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Image to Video
//           </button>
//           <button
//             onClick={() => handleTabClick("text-to-video")}
//             className={`px-6 py-3 font-medium text-lg ${
//               activeTab === "text-to-video"
//                 ? "text-blue-600 border-b-2 border-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Text to Video
//           </button>
//           {/* <button
//             onClick={() => handleTabClick("subject")}
//             className={`px-6 py-3 font-medium text-lg ${
//               activeTab === "subject"
//                 ? "text-blue-600 border-b-2 border-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Subject Reference
//           </button> */}
//         </div>

//         {/* Render component tương ứng với tab đang active */}
//         {activeTab === "image-to-video" && <ImageToVideo />}
//         {activeTab === "text-to-video" && <TextToVideo />}
//         {/* Thêm các component khác cho text và subject */}
//       </div>
//     </div>
//   );
// };

// export default CreateVideoPage;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import PromptInput from "../../components/PromptInput/PromptInput";
// import ImageUploader from "../../components/ImageUploader/ImageUploader";

// const CreateVideoPage = () => {
//   const [activeTab, setActiveTab] = useState("image");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isAdvanced, setIsAdvanced] = useState(false);
//   const [prompt, setPrompt] = useState("");
//   const [cameraMovement, setCameraMovement] = useState("static");
//   const [videoLength, setVideoLength] = useState(15);
//   const navigate = useNavigate();
//   const [uploadedImages, setUploadedImages] = useState([]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     // Chuyển hướng đến trang chức năng tương ứng
//     navigate(`/create-video/${tab}`);
//   };

//   const handleGenerateVideo = () => {
//     console.log("Generating video with:", {
//       prompt,
//       cameraMovement,
//       videoLength,
//     });
//     // Gọi API tạo video ở đây
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
//       <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-sm">
//         {/* Header với các tab */}
//         <div className="flex border-b border-gray-200 mb-6">
//           <button
//             onClick={() => handleTabClick("image")}
//             className={`px-6 py-3 font-medium text-lg ${
//               activeTab === "image"
//                 ? "text-blue-600 border-b-2 border-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Image to Video
//           </button>
//           <button
//             onClick={() => handleTabClick("text")}
//             className={`px-6 py-3 font-medium text-lg ${
//               activeTab === "text"
//                 ? "text-blue-600 border-b-2 border-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Text to Video
//           </button>
//           <button
//             onClick={() => handleTabClick("subject")}
//             className={`px-6 py-3 font-medium text-lg ${
//               activeTab === "subject"
//                 ? "text-blue-600 border-b-2 border-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Subject Reference
//           </button>
//         </div>

//         {/* Khu vực upload */}
//         <div className="mb-6">
//           <ImageUploader
//             multiple={true}
//             onFilesChange={setUploadedImages}
//             maxFiles={5}
//           />
//         </div>

//         {/* Khu vực nhập prompt */}
//         <PromptInput
//           value={prompt}
//           onChange={setPrompt}
//           advancedOptions={[
//             {
//               id: "camera",
//               label: "Camera Movement",
//               type: "select",
//               value: cameraMovement,
//               onChange: (e) => setCameraMovement(e.target.value),
//               options: [
//                 { value: "static", label: "Static" },
//                 { value: "zoom", label: "Zoom" },
//                 { value: "pan", label: "Pan" },
//               ],
//             },
//             {
//               id: "length",
//               label: "Video Length",
//               type: "slider",
//               value: videoLength,
//               onChange: (e) => setVideoLength(e.target.value),
//               min: 5,
//               max: 60,
//               labels: ["5s", "15s", "30s", "60s"],
//             },
//           ]}
//           onGenerate={handleGenerateVideo}
//         />

//         {/* Generations section */}
//         <div className="border-t border-gray-200 pt-6 mt-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-white">
//               Generations will appear here
//             </h3>
//             <button className="text-blue-600 hover:text-blue-800">
//               View guide
//             </button>
//           </div>
//           <div className=" rounded-lg p-8 text-center">
//             <p className="text-gray-500">
//               No generations yet. Create your first video!
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateVideoPage;

//  {/* Khu vực nhập prompt */}
//  <div className="mb-6">
//  <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-700 mb-2">
//    Video Description Prompt
//  </label>
//  <textarea
//    id="video-prompt"
//    rows={4}
//    value={prompt}
//    onChange={(e) => setPrompt(e.target.value)}
//    placeholder="Describe in detail the video you want to create (e.g., 'A panda dancing on a snowy mountain at sunset with cinematic lighting')"
//    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//  />

//  {/* Advanced options toggle */}
//  <div className="mt-2 flex items-center">
//    <button
//      onClick={() => setIsAdvanced(!isAdvanced)}
//      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
//    >
//      {isAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
//      <svg
//        className={`ml-1 h-4 w-4 transform ${isAdvanced ? 'rotate-180' : ''}`}
//        fill="none"
//        viewBox="0 0 24 24"
//        stroke="currentColor"
//      >
//        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//      </svg>
//    </button>
//  </div>

//  {/* Advanced options */}
//  {isAdvanced && (
//    <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
//      <div>
//        <label className="block text-sm font-medium text-gray-700 mb-1">Camera Movement</label>
//        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
//          <option>Select camera movement...</option>
//          <option>Static</option>
//          <option>Slow zoom in</option>
//          <option>Pan left to right</option>
//          <option>Drone flyover</option>
//        </select>
//      </div>

//      <div>
//        <label className="block text-sm font-medium text-gray-700 mb-1">Lighting Style</label>
//        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
//          <option>Select lighting...</option>
//          <option>Natural</option>
//          <option>Cinematic</option>
//          <option>Neon</option>
//          <option>Golden hour</option>
//        </select>
//      </div>

//      <div>
//        <label className="block text-sm font-medium text-gray-700 mb-1">Video Length</label>
//        <input
//          type="range"
//          min="5"
//          max="60"
//          defaultValue="15"
//          className="w-full"
//        />
//        <div className="flex justify-between text-xs text-gray-500">
//          <span>5 sec</span>
//          <span>15 sec</span>
//          <span>30 sec</span>
//          <span>60 sec</span>
//        </div>
//      </div>
//    </div>
//  )}
// </div>

{
  /* Overview section */
}
{
  /* <div className="mb-8">
<h3 className="text-lg font-medium text-gray-800 mb-4">Overview</h3>
<div className="space-y-3">
  <div className="flex items-center">
    <input
      type="checkbox"
      id="provides"
      className="h-5 w-5 text-blue-600 rounded"
    />
    <label htmlFor="provides" className="ml-2 text-gray-700">
      Provides
    </label>
  </div>
  <div className="flex items-center">
    <div className="relative">
      <select className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500">
        <option>Types: All Creations ▼</option>
        <option>Type 1</option>
        <option>Type 2</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
  <div className="flex items-center">
    <input
      type="checkbox"
      id="subscribe-fast"
      checked
      className="h-5 w-5 text-blue-600 rounded"
    />
    <label htmlFor="subscribe-fast" className="ml-2 text-gray-700">
      Subscribe to enjoy fast-track
    </label>
  </div>
  <div className="flex items-center">
    <input
      type="checkbox"
      id="subscribe"
      className="h-5 w-5 text-blue-600 rounded"
    />
    <label htmlFor="subscribe" className="ml-2 text-gray-700">
      Subscribe
    </label>
  </div>
</div>
</div> */
}

{
  /* Khu vực upload */
}
{
  /* <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
<div className="flex flex-col items-center justify-center">
  <svg
    className="w-12 h-12 text-gray-400 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
  <p className="text-lg font-medium text-gray-700 mb-2">
    Drop / Paste / Click to upload an image
  </p>
  <p className="text-gray-500 mb-4">
    You can enhance camera movement by inputting natural language or
    inserting instructions.{" "}
    <span className="text-blue-600 cursor-pointer">
      Learn how to control camera movements.
    </span>
  </p>
  <label className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
    Select Image
    <input
      type="file"
      onChange={handleFileChange}
      className="hidden"
      accept="image/*"
    />
  </label>
</div>
</div> */
}
