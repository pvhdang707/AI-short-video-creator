// pages/CreateVideo/Step2_Voice.jsx
import React, { useState } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import VoiceOptions from '../../components/VoiceOptions/VoiceOptions';
import FileUploader from '../../components/FileUploader/FileUploader';
//import { VIDEO_STEPS } from '../../constants';

const Step2_Voice = ({ script, onNext, onBack }) => {
    const [option, setOption] = useState('generate'); // 'generate' hoặc 'upload'
    const [voiceFile, setVoiceFile] = useState(null);
  
    return (
      <div>
        {/*<StepProgress currentStep={2} steps={VIDEO_STEPS} />*/}
        <StepProgress currentStep={2} />
        
        <div className="mb-6 p-4 w-full h-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500 border-2 border-gray-600 resize-y transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 transition ">
          <h3 className="font-bold mb-2">Script:</h3>
          <p className="text-gray-700">{script}</p>
        </div>
  
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setOption('generate')}
            className={`p-4 rounded-lg ${option === 'generate' ? 'border-2 border-blue-500' : 'border border-gray-300'}`}
          >
            Generate voice
          </button>
          <button 
            onClick={() => setOption('upload')}
            className={`p-4 rounded-lg ${option === 'upload' ? 'border-2 border-blue-500' : 'border border-gray-300'}`}
          >
            Upload voice file
          </button>
        </div>
  
        {option === 'generate' ? (
          <VoiceOptions 
            script={script}
            onVoiceGenerated={(voice) => setVoiceFile(voice)}
          />
        ) : (
          <FileUploader
            accept="audio/*"
            onFileChange={setVoiceFile}
            label="Chọn file giọng đọc"
          />
        )}
  
        <div className="flex justify-between mt-8">
          <button onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-lg">
            Back
          </button>
          <button 
            onClick={() => onNext({ voiceFile })}
            disabled={!voiceFile}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
};

export default Step2_Voice;