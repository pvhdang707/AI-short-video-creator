import React, { useState, useEffect } from "react";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import DiscoverCard from "../../components/DiscoverCard/DiscoverCard";
import CreateButton from "../../components/CreateButton/CreateButton";

const Explore = () => {
  // State quản lý input và file
  const [prompt, setPrompt] = useState(""); // Lưu nội dung textarea
  const [selectedFile, setSelectedFile] = useState(null); // Lưu file được chọn
  const [previewUrl, setPreviewUrl] = useState(null); // URL preview ảnh

  // State quản lý UI
  const [isScrolled, setIsScrolled] = useState(false); // Kiểm tra scroll
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  // Effect xử lý scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false); 
      }
    };

    // Thêm và xóa event listener
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Xử lý logic submit
    setIsLoading(false);
    console.log({ prompt, file: selectedFile });
  };

  // Xử lý khi hủy upload
  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // Reset input file để có thể chọn lại cùng file
    document.getElementById("file-upload").value = "";
  };

  // Dữ liệu mẫu cho phần hints
  const trendHints = [
    "Panda dances on snowy peak",
    "Warrhat vs frost dragon",
    "A man leans on a retro car",
    "A man leans on a retro car",
    "A man leans on a retro car",
    "A man leans on a retro car",
    "A man leans on a retro car",
  ];

  // Dữ liệu mẫu cho phần discover
  const discoverItems = [
    { title: "Haikuo AI", image: "/images/1.jpeg" },
    { title: "hecira", image: "/images/2.jpg" },
    { title: "Komiteo", image: "/images/3.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "Haikuo AI", image: "/images/1.jpeg" },
    { title: "hecira", image: "/images/2.jpg" },
    { title: "Komiteo", image: "/images/3.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "Haikuo AI", image: "/images/1.jpeg" },
    { title: "hecira", image: "/images/2.jpg" },
    { title: "Komiteo", image: "/images/3.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
    { title: "AniShort", image: "/images/4.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      {/* Header section - Sticky khi scroll */}
      <div className="w-full  top-0 z-10 bg-gradient-to-b from-gray-900 to-transparent transition-all duration-300 ">
      
        <div className={`max-w-4xl mx-auto text-center  px-4`}>
          {/* Tiêu đề chính */}
          <h1 className={`font-bold mb-4 font-mono transition-all duration-300 ${isScrolled ? "text-3xl" : "text-5xl"}`}>
            Transform Idea to Visual
          </h1>

          {/* Form input và buttons */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
            {/* Textarea cho prompt */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your idea here..."
              rows={1}
              className={`flex-1 px-6 py-4 text-lg bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500 border-2 border-gray-600 resize-y transition-all duration-300 ${
                isScrolled ? "min-h-[50px]" : "min-h-[120px]"
              }`}
            />

            {/* Container cho các nút */}
            <div className={`flex gap-4 justify-center transition-all duration-300 ${
              isScrolled ? "md:flex-row" : "md:flex-col"
            }`}>
              {/* Nút Upload */}
              <label className={`px-6 py-4 bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-600 transition flex items-center justify-center ${
                isScrolled ? "text-sm" : "text-base"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>

              {/* Nút Create */}
              <button
                type="submit"
                className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl font-bold hover:from-purple-700 hover:to-blue-600 transition flex items-center justify-center ${
                  isScrolled ? "text-sm" : "text-base"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Create
              </button>
            </div>
          </div>

          {/* Preview ảnh đã upload */}
          {!isScrolled &&selectedFile && (
            <div className="relative mt-4 max-w-xs mx-auto my-4">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="rounded-lg w-full h-auto max-h-60 object-cover"
              />
              {/* Nút xóa ảnh */}
              <button
                onClick={handleCancelUpload}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                aria-label="Cancel upload"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-sm text-gray-400 mt-2 truncate">
                {selectedFile.name}
              </p>
            </div>
          )}
          

          {/* Input file ẩn */}
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />

          {/* Phần gợi ý (chỉ hiển thị khi không scroll) */}
          {!isScrolled && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-2 text-gray-400">Hints</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {trendHints.map((hint, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition"
                    onClick={() => setPrompt(hint)}
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phần nội dung chính */}
      <div className="flex-grow">

        {/* Section Discover */}
        <SectionTitle title="Discover" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {discoverItems.map((item, index) => (
            <DiscoverCard key={index} title={item.title} image={item.image} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
//       {/* Phần header mới */}
//       <div className="max-w-4xl mx-auto text-center mb-12">
//         <h1 className="text-5xl font-bold mb-6 font-mono">
//           Transform Idea to Visual
//         </h1>
//         <p className="text-xl text-gray-300 mb-8">
//           Type your idea, click 'Create' to get a video
//         </p>

//         <form onSubmit={handleSubmit} className="mb-8">
//         <div className="flex flex-col md:flex-row gap-4 mb-4">
//   <textarea
//     value={prompt}
//     onChange={(e) => setPrompt(e.target.value)}
//     placeholder="Describe your idea here..."
//     rows={4} // Số dòng mặc định hiển thị
//     className="flex-1 px-6 py-4 text-lg bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500 border-2 border-gray-600 resize-y min-h-[120px]"
//   />

//   <div className="flex gap-4 justify-center md:flex-col">
//     <label className="px-6 py-4 bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-600 transition flex items-center justify-center">
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//       </svg>
//       Upload
//       <input
//         type="file"
//         onChange={handleFileChange}
//         className="hidden"
//         accept="image/*"
//       />
//     </label>

//     <button
//       type="submit"
//       className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl font-bold hover:from-purple-700 hover:to-blue-600 transition flex items-center justify-center"
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
//       </svg>
//       Create
//     </button>
//   </div>
// </div>

//           {selectedFile && (
//             <div className="mt-4">
//               <img
//                 src={URL.createObjectURL(selectedFile)}
//                 alt="Preview"
//                 className="max-h-40 rounded-lg"
//               />
//             </div>
//           )}
//         </form>

//         <div className="text-gray-400">
//           <h3 className="text-lg font-semibold mb-2">Hints</h3>
//           <div className="flex flex-wrap justify-center gap-3">
//             {trendHints.map((hint, index) => (
//               <span
//                 key={index}
//                 className="px-4 py-2 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition"
//                 onClick={() => setPrompt(hint)}
//               >
//                 {hint}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Phần còn lại giữ nguyên */}
//       <hr className="border-gray-700 my-8" />

//       <SectionTitle title="Discover" />
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
//         {discoverItems.map((item, index) => (
//           <DiscoverCard key={index} title={item.title} image={item.image} />
//         ))}
//       </div>

//       {/* ... các phần khác giữ nguyên ... */}
//     </div>
//   );


