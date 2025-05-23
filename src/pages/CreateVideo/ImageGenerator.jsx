// pages/CreateVideo/Step3_Images.jsx
import React, { useState } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import PromptInput from '../../components/PromptInput/PromptInput';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
//import { VIDEO_STEPS } from '../../constants';
// import { generateImages } from '../../services/imageService';

const Step3_Images = ({ script, onNext, onBack }) => {
    const [option, setOption] = useState('generate'); // 'generate' hoặc 'upload'
    const [images, setImages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
  
    const handleGenerate = async () => {
      if (!prompt) return;
      
      setIsGenerating(true);
      try {
        // TODO: Gọi API generate images ở đây
        // const generatedImages = await generateImages(prompt);
        // setImages(generatedImages);
        
        // Demo với setTimeout
        setTimeout(() => {
          const demoImages = [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg'
          ];
          setImages(demoImages);
          setIsGenerating(false);
        }, 2000);
      } catch (error) {
        console.error('Error generating images:', error);
        setIsGenerating(false);
      }
    };
  
    return (
      <div>
        {/*<StepProgress currentStep={3} steps={VIDEO_STEPS} />*/}
        <StepProgress currentStep={3}  />
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setOption('generate')}
            className={`p-4 rounded-lg ${option === 'generate' ? 'border-2 border-blue-500 bg-gray-800' : 'border border-gray-700'}`}
          >
            Generate images
          </button>
          <button 
            onClick={() => setOption('upload')}
            className={`p-4 rounded-lg ${option === 'upload' ? 'border-2 border-blue-500 bg-gray-800' : 'border border-gray-700'}`}
          >
            Upload images
          </button>
        </div>
  
        <div>
          {option === 'generate' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <PromptInput
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="flex-1"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt || isGenerating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    transition-colors duration-200 whitespace-nowrap"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Generate'}
                </button>
              </div>
            </div>
          ) : (
            <ImageUploader
              onImagesChange={setImages}
              maxFiles={10}
              accept="image/*"
              multiple
            />
          )}
          {/* <ImageGallery images={images} onSelect={setImages} /> */}
        </div>
  
        <div className="flex justify-between mt-8">
          <button 
            onClick={onBack} 
            className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Back
          </button>
          <button 
            onClick={() => onNext({ images })}
            disabled={images.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
              transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    );
};

export default Step3_Images;