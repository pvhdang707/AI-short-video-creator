import React, { useState, useEffect, useCallback } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import PromptInput from '../../components/PromptInput/PromptInput';
import { imageAPI } from '../../services/api';


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
            
            // Lưu data từ response vào state
            if (response.data && Array.isArray(response.data)) {
                const imagesMap = {};
                response.data.forEach((image, index) => {
                    // Tìm scene tương ứng với index
                    const scene = script.scenes[index];
                    if (scene) {
                        // Sử dụng index + 1 làm key thay vì scene_number
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
                // imageMap phải có phần tử mới gán vào state
                if(Object.keys(imagesMap).length === 0) {
                    setError('Có lỗi xảy ra khi tạo hình ảnh');
                    setLoading(false);
                    return;
                }
                
                setGeneratedImages(imagesMap);
                console.log('generatedImages', imagesMap);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error generating images:', error);
            setError('Có lỗi xảy ra khi tạo hình ảnh');
            setLoading(false);
        }
    }

    const handleRegenerateForScene = async (sceneNumber, prompt) => {
        try {
            setRegeneratingScene(sceneNumber);
            const newImage = await generateImageForScene(sceneNumber, prompt);
            console.log('New image data:', newImage);
            
            // Cập nhật hình ảnh mới vào đúng vị trí
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
            setError('Có lỗi xảy ra khi tạo lại hình ảnh');
            setRegeneratingScene(null);
        }
    }

    const generateImageForScene = async (sceneNumber, prompt) => {
        // Lấy thông tin scene từ generatedImages
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
        // Chỉ gọi API khi script.id tồn tại và chưa có hình ảnh nào được tạo
        if (script?.id && Object.keys(generatedImages).length === 0) {
            generateImagesForScript();
        }
    }, [script?.id]); // Chỉ phụ thuộc vào script.id

    return (

        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header với Step Progress */}
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
                    <StepProgress currentStep={3} />
                    <h1 className="text-2xl font-bold mt-4 text-center">Tạo hình ảnh cho video</h1>
                    <p className="text-gray-400 text-center mt-2">
                        Hệ thống sẽ tự động tạo hình ảnh dựa trên kịch bản của bạn
                    </p>
                </div>

                {/* Loading State */}
                {loading  ? (
                    <div className="flex items-center justify-center p-12 bg-gray-800/50 rounded-xl">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400 text-lg">Đang tạo hình ảnh cho video...</p>
                            <p className="text-gray-500 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                        </div>
                    </div>
                ) : (
                    /* Danh sách các scene */
                    <div className="space-y-6">
                        {script?.scenes?.map((scene, index) => {
                            // Sử dụng index + 1 để lấy hình ảnh tương ứng
                            const sceneImage = generatedImages[index + 1];
                            
                            return (
                                <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-blue-400">
                                                Cảnh {index + 1}
                                            </h3>
                                            {sceneImage && (
                                                <span className="text-sm text-gray-400">
                                                    {new Date(sceneImage.created_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Phần hình ảnh */}
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    {sceneImage ? (
                                                        <div className="aspect-video overflow-hidden rounded-lg bg-gray-900">
                                                            <img 
                                                                src={sceneImage.url} 
                                                                alt={`Cảnh ${index + 1}`}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            {regeneratingScene === index + 1 && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                                                                <p className="text-gray-400">Đang tạo hình ảnh...</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thông tin hình ảnh */}
                                                {sceneImage && (
                                                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-400 mb-1">Prompt:</h4>
                                                            <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">{sceneImage.prompt}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span>Kích thước: {sceneImage.width}x{sceneImage.height}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Phần thông tin và chỉnh sửa */}
                                            <div className="space-y-6">
                                                {/* Thông tin scene */}
                                                <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                                                    <h4 className="text-lg font-semibold text-blue-400">Thông tin cảnh</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-1">Mô tả:</h5>
                                                            <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{scene.description}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-1">Yếu tố hình ảnh:</h5>
                                                            <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{scene.visual_elements}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-1">Giọng đọc:</h5>
                                                            <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{scene.voice_over}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-1">Nhạc nền:</h5>
                                                            <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{scene.background_music}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phần chỉnh sửa */}
                                                <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                                                    <h4 className="text-lg font-semibold text-blue-400">Chỉnh sửa hình ảnh</h4>
                                                    <div className="space-y-3">
                                                        <PromptInput
                                                            value={scenePrompts[index + 1] || ''}
                                                            onChange={(e) => setScenePrompts(prev => ({
                                                                ...prev,
                                                                [index + 1]: e.target.value
                                                            }))}
                                                            placeholder="Nhập mô tả mới để tạo lại hình ảnh..."
                                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <button
                                                            onClick={() => handleRegenerateForScene(index + 1, scenePrompts[index + 1])}
                                                            disabled={!scenePrompts[index + 1] || regeneratingScene === index + 1}
                                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                                                     hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                                        >
                                                            {regeneratingScene === index + 1 ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                                    <span>Tạo lại hình ảnh...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                    <span>Tạo lại hình ảnh</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button 
                        onClick={onBack} 
                        className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors duration-200
                                 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <button 
                        // onClick={handleNext}
                        disabled={loading || !Object.keys(generatedImages).length}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <span>Tiếp tục</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg shadow-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step3_Images;