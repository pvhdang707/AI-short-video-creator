import React, { useState } from "react";
import StepProgressV2 from '../../../components/StepProgress/StepProgressV2';
import ScriptGenerator from "./ScriptGenerator";
import ContentGenerator from "./ContentGenerator";
import VideoGenerator from "./VideoGenerator";

const CreateVideoV2 = () => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    script: null,
    content: null,
    video: null
  });

  const nextStep = (data) => {
    if (step === 1) {
      setProjectData(prev => ({
        ...prev,
        script: data
      }));
    } else if (step === 2) {
      setProjectData(prev => ({
        ...prev,
        content: data
      }));
    } else if (step === 3) {
      setProjectData(prev => ({
        ...prev,
        video: data
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
        <div className="max-w-[90rem] mx-auto space-y-8">
          {/* Header với Step Progress */}
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
            <StepProgressV2 currentStep={step} totalSteps={3} />
            <h1 className="text-2xl font-bold mt-4 text-center text-white">
              {step === 1 && "Tạo Kịch Bản"}
              {step === 2 && "Tạo Nội Dung"}
              {step === 3 && "Tạo Video"}
            </h1>
            <p className="text-gray-400 text-center mt-2">
              {step === 1 && "Nhập ý tưởng và chọn phong cách cho video của bạn"}
              {step === 2 && "Xem trước và chỉnh sửa nội dung cho từng cảnh"}
              {step === 3 && "Tạo video từ nội dung đã chuẩn bị"}
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-gray-800/50 rounded-xl p-8 shadow-lg">
          <div>

            {step === 1 && (
              <ScriptGenerator 
                onNext={nextStep} 
                initialScript={projectData.script}
              />
            )}
            {step === 2 && (
              <ContentGenerator 
                script={projectData.script}
                onNext={nextStep}
                onBack={prevStep}
                initialContent={projectData.content}
              />
            )}
            {step === 3 && (
              <VideoGenerator
                script={projectData.script}
                content={projectData.content}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoV2; 