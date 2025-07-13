import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import StepProgressV2 from '../../../components/StepProgress/StepProgressV2';
import ScriptGenerator from "./ScriptGenerator";
import ContentGenerator from "./ContentGenerator";
import VideoGenerator from "./VideoGenerator";
import { projectService } from '../../../services/projectService';
import { toast } from 'react-toastify';

const LOCAL_STORAGE_KEY = 'createVideoV2';

const CreateVideoV2 = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    script: null,
    content: null,
    video: null
  });
  const [videoIdea, setVideoIdea] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu khi mount
  useEffect(() => {
    const scriptId = searchParams.get('scriptId');
    
    // Kiểm tra xem có dữ liệu project từ ProjectDetail không
    if (location.state?.projectData && location.state?.editMode) {
      const projectDataFromState = location.state.projectData;
      setProjectData(prev => ({
        ...prev,
        script: projectDataFromState,
        content: projectDataFromState.scenes, // Điền content bằng scenes hiện có
      }));
      
      // Khi ở chế độ edit, luôn chuyển đến bước 2 để chỉnh sửa
      setStep(2);
      
      return;
    }
    
    if (scriptId) {
      // Nếu có scriptId, load script từ backend
      loadExistingScript(scriptId);
    } else {
      // Nếu không có scriptId, load từ localStorage
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Kiểm tra script.scenes phải là mảng
          if (parsed && parsed.script && Array.isArray(parsed.script.scenes)) {
            setProjectData(parsed);
            // Nếu đã có bước content thì chuyển đến bước tiếp theo
            if (parsed.video) setStep(4);
            else if (parsed.content) setStep(3);
            else if (parsed.script) setStep(2);
          } else {
            // Dữ liệu lỗi, reset về bước 1 và xóa localStorage
            setProjectData({ script: null, content: null, video: null });
            setStep(1);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } catch {
          setProjectData({ script: null, content: null, video: null });
          setStep(1);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    }
    
    // Nếu có videoIdea truyền từ ItemDetail, set vào state
    if (location.state?.videoIdea) {
      setVideoIdea(location.state.videoIdea);
    }
  }, [location.state, searchParams]);

  const loadExistingScript = async (scriptId) => {
    setLoading(true);
    try {
      const script = await projectService.getScriptById(scriptId);
      setProjectData(prev => ({
        ...prev,
        script: script
      }));
      
      // Nếu script đã có video_url, chuyển đến bước cuối
      if (script.video_url) {
        setStep(4);
      } else if (script.scenes && script.scenes.length > 0) {
        // Nếu có scenes, chuyển đến bước content
        setStep(3);
      } else {
        // Nếu chỉ có script cơ bản, chuyển đến bước 2
        setStep(2);
      }
      
      toast.success('✅ Project data loaded successfully');
    } catch (error) {
      console.error('Error loading script:', error);
      toast.error('❌ Unable to load project data');
    } finally {
      setLoading(false);
    }
  };

  // Lưu vào localStorage mỗi khi projectData thay đổi
  useEffect(() => {
    try {
      // Tạo bản sao của projectData nhưng loại bỏ audio base64 để tránh vượt quota
      const dataToSave = {
        script: projectData.script,
        content: projectData.content ? projectData.content.map(scene => ({
          id: scene.id,
          scene_number: scene.scene_number,
          voice_over: scene.voice_over,
          visual_elements: scene.visual_elements,
          // Chỉ lưu thông tin voice cơ bản, không lưu audio_base64
          voice: scene.voice ? {
            voice_id: scene.voice.voice_id,
            speed: scene.voice.speed,
            file_name: scene.voice.file_name,
            has_audio: !!scene.voice.audio_base64
          } : null,
          image: scene.image ? {
            id: scene.image.id,
            url: scene.image.url,
            prompt: scene.image.prompt,
            width: scene.image.width,
            height: scene.image.height
          } : null
        })) : null,
        video: projectData.video
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Cannot save to localStorage:', error);
      // If quota error, try to delete old data and save again
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        // Thử lưu lại với dữ liệu tối thiểu
        const minimalData = {
          script: projectData.script ? {
            id: projectData.script.id,
            title: projectData.script.title,
            description: projectData.script.description
          } : null,
          content: projectData.content ? projectData.content.length : 0,
          video: projectData.video
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(minimalData));
      } catch (retryError) {
        console.error('Vẫn không thể lưu vào localStorage sau khi thử lại:', retryError);
      }
    }
  }, [projectData]);

  const nextStep = (data) => {
    let newProjectData = { ...projectData };
    if (step === 1) {
      newProjectData = { ...newProjectData, script: data };
    } else if (step === 2) {
      newProjectData = { ...newProjectData, content: data };
    } else if (step === 3) {
      newProjectData = { ...newProjectData, video: data };
    }
    setProjectData(newProjectData);
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Hàm reset dữ liệu (nếu cần)
  const resetProject = () => {
    setProjectData({ script: null, content: null, video: null });
    setStep(1);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
          <p className="text-lg font-medium text-gray-300">Loading project data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container w-full h-full px-8 py-12 mx-auto">
        <div className="max-w-[90rem] mx-auto space-y-8">
          {/* Header với Step Progress */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 p-8 rounded-xl shadow-lg">
            
            
            <StepProgressV2 currentStep={step} totalSteps={3} />
            
            

            {/* {location.state?.editMode && (
              <div className="text-center mt-4">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-600/30 text-blue-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Mode
                </span>
              </div>
            )} */}
            
            {/* Nút reset */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={resetProject} 
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 border border-red-600/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-sm font-medium transition-all duration-300"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Start Over</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl shadow-lg overflow-hidden">
            {step === 1 && (
              <ScriptGenerator 
                onNext={nextStep} 
                initialScript={projectData.script}
                initialIdea={videoIdea}
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
  );
};

export default CreateVideoV2;