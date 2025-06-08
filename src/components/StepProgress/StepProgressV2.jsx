import React from 'react';

const StepProgressV2 = ({ currentStep, totalSteps }) => {
  const steps = [
    {
      title: 'Kịch bản',
      description: 'Tạo và chỉnh sửa kịch bản'
    },
    {
      title: 'Nội dung',
      description: 'Tạo và chỉnh sửa nội dung'
    },
    {
      title: 'Video',
      description: 'Tạo và xuất video'
    }
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = currentStep === index + 1;
          const isCompleted = currentStep > index + 1;
          
          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-200
                    ${isActive ? 'border-blue-500 bg-blue-500' : ''}
                    ${isCompleted ? 'border-green-500 bg-green-500' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-600 bg-gray-700' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-lg font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                  {step.title}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {step.description}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 relative">
                  <div className="absolute inset-0 bg-gray-700" />
                  <div
                    className={`absolute inset-0 bg-blue-500 transition-all duration-300`}
                    style={{
                      width: isCompleted ? '100%' : isActive ? '50%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressV2; 