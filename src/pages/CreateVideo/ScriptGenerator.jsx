// pages/CreateVideo/Step1_Script.jsx
import React, { useState } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import PromptInput from '../../components/PromptInput/PromptInput';
//import { VIDEO_STEPS } from '../../constants';
//import { generateScript } from '../../services/scriptService';

const Step1_Script = ({ onNext }) => {
    const [option, setOption] = useState('ai'); // 'manual' hoặc 'ai'
    const [script, setScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
  
    const handleGenerate = async () => {
      if (!prompt) return;
      
      setIsGenerating(true);
      try {
        // TODO: Gọi API generate script ở đây
        // const generatedScript = await generateScript(prompt);
        // setScript(generatedScript);
        
        // Tạm thời dùng setTimeout để demo
        setTimeout(() => {
          setScript(`This is the script generated from the prompt: "${prompt}"`);
          setIsGenerating(false);
        }, 2000);
      } catch (error) {
        console.error('Error generating script:', error);
        setIsGenerating(false);
      }
    };

    const handlePromptChange = (e) => {
      if (e && e.target) {
        setPrompt(e.target.value);
      }
    };
  
    return (
      <div>
        {/*<StepProgress currentStep={1} steps={VIDEO_STEPS} />*/}
        <StepProgress currentStep={1}  />
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setOption('ai')}
            className={`p-4 rounded-lg ${option === 'ai' ? 'border-2 border-blue-500' : 'border border-gray-300'}`}
          >
            AI Suggest script
          </button>
          <button 
            onClick={() => setOption('manual')}
            className={`p-4 rounded-lg ${option === 'manual' ? 'border-2 border-blue-500' : 'border border-gray-300'}`}
          >
            Enter your script
          </button>
        </div>
  
        {option === 'manual' ? (
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:border-blue-500 border-2 border-gray-600 resize-y transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 transition"
            placeholder="Enter your script here..."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <PromptInput
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Enter your idea for the video..."
                className="flex-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 whitespace-nowrap"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {script && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Script generated:</h3>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 transition"
                  placeholder="The script will be displayed here..."
                />
              </div>
            )}
          </div>
        )}
  
        <div className="flex justify-end mt-4">
          <button 
            onClick={() => onNext({ script })}
            disabled={!script}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
};

export default Step1_Script;