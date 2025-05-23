import React, { useState } from "react";
import PromptInput from "../../components/PromptInput/PromptInput";
import ImageUploader from "../../components/ImageUploader/ImageUploader";

const ImageToVideo = () => {
  const [prompt, setPrompt] = useState("");
  const [cameraMovement, setCameraMovement] = useState("static");
  const [videoLength, setVideoLength] = useState(15);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generationResult, setGenerationResult] = useState(null);

  const handleGenerateVideo = () => {
    const result = (
      <div>
        <p><b>Prompt:</b> {prompt}</p>
        <p><b>Camera:</b> {cameraMovement}</p>
        <p><b>Length:</b> {videoLength}s</p>
        <p><b>Số ảnh upload:</b> {uploadedImages.length}</p>
      </div>
    );
    setGenerationResult(result);
  };

  return (
    <div className="w-full">

    <div className="grid grid-cols-2 gap-8">
      {/* Cột trái: uploader + prompt input */}
      <div>
        <div className="mb-6">
          <ImageUploader
            multiple={true}
            onFilesChange={setUploadedImages}
            maxFiles={5}
          />
        </div>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          advancedOptions={[
            {
              id: "camera",
              label: "Camera Movement",
              type: "select",
              value: cameraMovement,
              onChange: (e) => setCameraMovement(e.target.value),
              options: [
                { value: "static", label: "Static" },
                { value: "zoom", label: "Zoom" },
                { value: "pan", label: "Pan" },
              ],
            },
            {
              id: "length",
              label: "Video Length",
              type: "slider",
              value: videoLength,
              onChange: (e) => setVideoLength(e.target.value),
              min: 5,
              max: 60,
              labels: ["5s", "15s", "30s", "60s"],
            },
          ]}
          onGenerate={handleGenerateVideo}
        />
      </div>
      {/* Cột phải: kết quả generate */}
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col h-full min-h-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">
            Generations will appear here
          </h3>
        </div>
        <div className="rounded-lg p-8 text-center border-2 border-dashed border-gray-600 flex-1 flex items-center justify-center">
          {generationResult ? (
            generationResult
          ) : (
            <p className="text-gray-500">
              No generations yet. Create your first video!
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ImageToVideo;
