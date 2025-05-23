import React, { useState } from 'react';

const VOICE_OPTIONS = [
  {
    id: 'vi-VN-Standard-A',
    name: 'Female - North',
    language: 'vi-VN',
    gender: 'female',
    region: 'north'
  },
  {
    id: 'vi-VN-Standard-B',
    name: 'Male - North',
    language: 'vi-VN',
    gender: 'male',
    region: 'north'
  },
  {
    id: 'vi-VN-Standard-C',
    name: 'Female - South',
    language: 'vi-VN',
    gender: 'female',
    region: 'south'
  },
  {
    id: 'vi-VN-Standard-D',
    name: 'Male - South',
    language: 'vi-VN',
    gender: 'male',
    region: 'south'
  }
];

const VoiceOptions = ({ script, onVoiceGenerated }) => {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleGenerate = async () => {
    if (!selectedVoice || !script) return;

    setIsGenerating(true);
    try {
      // TODO: Gọi API Google TTS ở đây
      // const audioUrl = await generateTTS(script, selectedVoice);
      // setPreviewUrl(audioUrl);
      // onVoiceGenerated(audioUrl);

      // Demo với setTimeout
      setTimeout(() => {
        const demoUrl = 'https://example.com/demo-audio.mp3';
        setPreviewUrl(demoUrl);
        onVoiceGenerated(demoUrl);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating voice:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 shadow-lg text-white">
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-sm font-semibold">Choose a voice that matches your content</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {VOICE_OPTIONS.map((voice) => (
          <label
            key={voice.id}
            className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200
              ${selectedVoice === voice.id 
                ? 'border-2 border-blue-500 bg-gray-800 ring-2 ring-blue-500/30' 
                : 'border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50'
              }
              focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500`}
          >
            <input
              type="radio"
              name="voice"
              value={voice.id}
              checked={selectedVoice === voice.id}
              onChange={() => setSelectedVoice(voice.id)}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{voice.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {voice.gender === 'female' ? 'Female' : 'Male'} - {voice.region === 'north' ? 'North' : 'South'}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedVoice === voice.id ? 'border-blue-500' : 'border-gray-600'}`}
              >
                {selectedVoice === voice.id && (
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-700">
        <button
          onClick={handleGenerate}
          disabled={!selectedVoice || !script || isGenerating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-colors duration-200"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : 'Generate voice'}
        </button>
      </div>

      {previewUrl && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="font-medium mb-3">Preview voice:</h3>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <audio controls className="w-full">
              <source src={previewUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceOptions;