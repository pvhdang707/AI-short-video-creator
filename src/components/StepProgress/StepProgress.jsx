// components/shared/StepProgress.jsx
const StepProgress = ({ currentStep }) => {
    const steps = [
      { id: 1, title: 'Script' },
      { id: 2, title: 'Voice' },
      { id: 3, title: 'Images' },
      { id: 4, title: 'Video' },
    ];

    return (
      <div className="flex justify-around mb-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${currentStep >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {index + 1}
            </div>
            <span className={`mt-2 text-sm ${currentStep === index + 1 ? 'font-bold' : ''}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    );
  };

export default StepProgress;