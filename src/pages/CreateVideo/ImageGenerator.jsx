import React, { useState, useEffect } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import { imageAPI } from '../../services/api';
import LoadingState from '../../components/ImageGenerator/LoadingState';
import ErrorMessage from '../../components/ImageGenerator/ErrorMessage';
import SceneImage from '../../components/ImageGenerator/SceneImage';
import SceneInfo from '../../components/ImageGenerator/SceneInfo';
import SceneEditor from '../../components/ImageGenerator/SceneEditor';

const Step3_Images = ({ script, onNext, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatedImages, setGeneratedImages] = useState({});
    const [regeneratingScene, setRegeneratingScene] = useState(null);
    const [scenePrompts, setScenePrompts] = useState({});

    const generateImagesForScript = async () => {
        try {
            const response = await imageAPI.generateImagesForScript(script.id);
            console.log('response', response);
            
            if (response.data && Array.isArray(response.data)) {
                const imagesMap = {};
                response.data.forEach((image, index) => {
                    const scene = script.scenes[index];
                    if (scene) {
                        imagesMap[index + 1] = {
                            id: image.id,
                            url: image.image_url,
                            prompt: image.prompt,
                            width: image.width,
                            height: image.height,
                            created_at: image.created_at,
                            scene_id: image.scene_id
                        };
                    }
                });
                
                // nếu imagesMap không có dữ liệu thì không set
                if (Object.keys(imagesMap).length > 0) {
                    setGeneratedImages(imagesMap);
                    console.log('generatedImages', imagesMap);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error generating images:', error);
            setLoading(false);
        }
    }

    const handleRegenerateForScene = async (sceneNumber, prompt) => {
        try {
            setRegeneratingScene(sceneNumber);
            const newImage = await generateImageForScene(sceneNumber, prompt);
            console.log('New image data:', newImage);
            
            setGeneratedImages(prev => {
                const updatedImages = { ...prev };
                updatedImages[sceneNumber] = {
                    id: newImage.id,
                    url: newImage.image_url,
                    prompt: newImage.prompt,
                    width: newImage.width,
                    height: newImage.height,
                    created_at: newImage.created_at,
                    scene_id: newImage.scene_id
                };
                console.log('Updated images:', updatedImages);
                return updatedImages;
            });
            
            setRegeneratingScene(null);
        } catch (error) {
            console.error('Error regenerating image:', error);
            setRegeneratingScene(null);
        }
    }

    const generateImageForScene = async (sceneNumber, prompt) => {
        const existingImage = generatedImages[sceneNumber];
        if (!existingImage || !existingImage.scene_id) {
            console.error('Image not found or missing id:', existingImage);
            throw new Error('Không tìm thấy thông tin scene');
        }

        console.log('Generating image for scene:', {
            scene_id: existingImage.scene_id,
            prompt: prompt,
            width: 1024,
            height: 768
        });

        const response = await imageAPI.generateImage({
            scene_id: existingImage.scene_id,
            prompt: prompt,
            width: 1024,
            height: 768
        });
        console.log('API response:', response.data);
        return response.data;
    }

    useEffect(() => {
        if (script?.id && Object.keys(generatedImages).length === 0) {
            generateImagesForScript();
        }
    }, [script?.id]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
                    <StepProgress currentStep={3} />
                    <h1 className="text-2xl font-bold mt-4 text-center">Generate Images for Video</h1>
                    <p className="text-gray-400 text-center mt-2">
                        The system will automatically generate images based on your script
                    </p>
                </div>

                {loading ? (
                    <LoadingState />
                ) : (
                    <div className="space-y-6">
                        {script?.scenes?.map((scene, index) => {
                            const sceneNumber = index + 1;
                            const sceneImage = generatedImages[sceneNumber];
                            
                            return (
                                <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-blue-400">
                                                Scene {sceneNumber}
                                            </h3>
                                            {sceneImage && (
                                                <span className="text-sm text-gray-400">
                                                    {new Date(sceneImage.created_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <SceneImage 
                                                sceneImage={sceneImage}
                                                sceneNumber={sceneNumber}
                                                isRegenerating={regeneratingScene === sceneNumber}
                                            />

                                            <div className="space-y-6">
                                                <SceneInfo scene={scene} />
                                                
                                                <SceneEditor
                                                    sceneNumber={sceneNumber}
                                                    prompt={scenePrompts[sceneNumber] || ''}
                                                    onPromptChange={(value) => setScenePrompts(prev => ({
                                                        ...prev,
                                                        [sceneNumber]: value
                                                    }))}
                                                    onRegenerate={handleRegenerateForScene}
                                                    isRegenerating={regeneratingScene === sceneNumber}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <button 
                        onClick={onBack} 
                        className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors duration-200
                                 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <button 
                        onClick={onNext}
                        disabled={loading || !Object.keys(generatedImages).length}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <span>Continue</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <ErrorMessage message={error} />
            </div>
        </div>
    );
};

export default Step3_Images;