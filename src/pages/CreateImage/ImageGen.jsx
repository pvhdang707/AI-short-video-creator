import React, { useState } from "react";
import PromptInput from "../../components/PromptInput/PromptInput";

const ImageGen = () => {
  const [prompt, setPrompt] = useState("");
  const [cameraMovement, setCameraMovement] = useState("static");
  const [generationResult, setGenerationResult] = useState(null);

  const handleGenerateImage = () => {
    const result = (
      <div>
        <p><b>Prompt:</b> {prompt}</p>
        <p><b>Camera:</b> {cameraMovement}</p>
        <div className="mt-4">
          <img
            src="https://placehold.co/400x250?text=Generated+Image"
            alt="Generated"
            className="mx-auto rounded shadow"
          />
        </div>
      </div>
    );
    setGenerationResult(result);
  };

  return (
    <div className="grid grid-cols-2 gap-8 min-h-[400px]">
      {/* Cột trái: prompt input */}
      <div>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          label="Describe what you want to see"
          placeholder="A beautiful landscape with a river and mountains..."
          generateText="Generate Image"
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
          ]}
          onGenerate={handleGenerateImage}
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
  );
};

export default ImageGen;
