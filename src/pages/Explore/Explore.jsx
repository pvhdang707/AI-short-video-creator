import React, { useState } from "react";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import ItemCard from "../../components/ItemCard/ItemCard";
import CreateButton from "../../components/CreateButton/CreateButton";
import sampleItems from '../../data/sampleItems.json';

const Explore = () => {
  // State quản lý input và file
  const [prompt, setPrompt] = useState(""); // Lưu nội dung textarea
  const [selectedFile, setSelectedFile] = useState(null); // Lưu file được chọn
  const [previewUrl, setPreviewUrl] = useState(null); // URL preview ảnh

  // State quản lý UI
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  // State cho input search
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Tất cả"); // State cho filter trending

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
    "Mountain Landscape",
    "Ocean Sunset",
    "City Lights",
    "Forest Path",
    "Desert Dunes",
    "Waterfall",
    "Northern Lights",
  ];

  // Danh sách topic trending mẫu
  const trendingTopics = [
    "Tất cả",
    "Landscape",
    "Nature",
    "City",
    "Fantasy",
    "Abstract",
    "Night",
  ];

  // Sử dụng dữ liệu từ sampleItems.json
  const trendingItems = sampleItems.items;

  // Lọc trending theo topic và search
  const filteredTrending = trendingItems.filter(
    (item) =>
      (selectedTopic === "Tất cả" || item.title.toLowerCase().includes(selectedTopic.toLowerCase())) &&
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white h-full">
      
      {/* Header section */}
      <div className="w-full pt-10 pb-10 z-10 bg-gradient-to-b from-gray-900 to-transparent transition-all duration-300 ">
        <div className=" mx-auto text-center px-4">
          {/* Tiêu đề chính */}
          <h1 className="font-bold py-4 mb-4 font-mono text-5xl">
            Explore Trending Creations
          </h1>

          {/* Input search + nút search */}
          <div className="flex justify-center mb-6 gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full max-w-xl px-6 py-4 text-lg bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500 border-2 border-gray-600 transition-all duration-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Có thể xử lý search tại đây nếu muốn
                }
              }}
            />
            <button
              className="px-6 py-4 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition"
              onClick={() => {
                // Có thể xử lý search tại đây nếu muốn
              }}
            >
              Search
            </button>
          </div>

          {/* Phần gợi ý */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-2 text-gray-400">Hints</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {trendHints.map((hint, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition"
                  onClick={() => setSearch(hint)}
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending section */}
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Trending" />
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {trendingTopics.map((topic) => (
            <button
              key={topic}
              className={`px-4 py-2 rounded-full transition ${
                selectedTopic === topic
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Grid items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {filteredTrending.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.image}
              item={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
