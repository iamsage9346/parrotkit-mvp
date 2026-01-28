'use client';

import React, { useState } from 'react';
import { CameraShooting } from './CameraShooting';
import { RecipeVideoPlayer } from './RecipeVideoPlayer';

interface RecipeScene {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  thumbnail: string;
  description: string;
  progress: number;
}

interface RecipeResultProps {
  scenes: RecipeScene[];
  videoUrl: string;
  onBack?: () => void;
  recipeId?: number; // 레시피 ID 추가
  initialCapturedVideos?: {[key: number]: boolean}; // 초기 촬영 데이터
  initialMatchResults?: {[key: number]: boolean}; // 초기 매칭 결과
}

export const RecipeResult: React.FC<RecipeResultProps> = ({ 
  scenes, 
  videoUrl, 
  onBack,
  recipeId,
  initialCapturedVideos = {},
  initialMatchResults = {}
}) => {
  const [selectedScene, setSelectedScene] = useState<RecipeScene | null>(null);
  const [activeTab, setActiveTab] = useState<'recipe' | 'shooting'>('recipe');
  const [capturedVideos, setCapturedVideos] = useState<{[key: number]: Blob}>({});
  const [matchResults, setMatchResults] = useState<{[key: number]: boolean}>(initialMatchResults);
  const [isExporting, setIsExporting] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [capturedScenes, setCapturedScenes] = useState<{[key: number]: boolean}>(initialCapturedVideos);

  const handleSceneClick = (scene: RecipeScene) => {
    setSelectedScene(scene);
    setActiveTab('recipe'); // 기본으로 Recipe 탭 표시
  };

  const handleVideoCapture = async (videoBlob: Blob) => {
    if (!selectedScene) return;
    
    console.log('Video captured:', videoBlob);
    
    // 촬영한 비디오 저장
    setCapturedVideos(prev => ({
      ...prev,
      [selectedScene.id]: videoBlob,
    }));

    // 촬영 완료 표시
    setCapturedScenes(prev => ({
      ...prev,
      [selectedScene.id]: true
    }));

    // localStorage에 업데이트 (레시피 ID가 있을 때)
    if (recipeId) {
      const savedRecipes = JSON.parse(localStorage.getItem('myRecipes') || '[]');
      const recipeIndex = savedRecipes.findIndex((r: any) => r.id === recipeId);
      
      if (recipeIndex !== -1) {
        savedRecipes[recipeIndex].capturedVideos = {
          ...savedRecipes[recipeIndex].capturedVideos,
          [selectedScene.id]: true
        };
        savedRecipes[recipeIndex].capturedCount = Object.keys(savedRecipes[recipeIndex].capturedVideos).length;
        localStorage.setItem('myRecipes', JSON.stringify(savedRecipes));
      }
    }

    // AI 비교 시뮬레이션 (1초 후 결과)
    setTimeout(() => {
      const isMatch = Math.random() > 0.3; // 70% 확률로 성공
      setMatchResults(prev => ({
        ...prev,
        [selectedScene.id]: isMatch,
      }));
      
      // localStorage에 매칭 결과 저장
      if (recipeId) {
        const savedRecipes = JSON.parse(localStorage.getItem('myRecipes') || '[]');
        const recipeIndex = savedRecipes.findIndex((r: any) => r.id === recipeId);
        
        if (recipeIndex !== -1) {
          savedRecipes[recipeIndex].matchResults = {
            ...savedRecipes[recipeIndex].matchResults,
            [selectedScene.id]: isMatch
          };
          localStorage.setItem('myRecipes', JSON.stringify(savedRecipes));
        }
      }
      
      if (isMatch) {
        alert('✅ Perfect match! Scene completed.');
        setSelectedScene(null);
      } else {
        alert('⚠️ Try again! Position doesn\'t match.');
      }
    }, 1000);
  };

  const handleCameraBack = () => {
    setSelectedScene(null);
    setActiveTab('recipe');
  };

  // 모든 촬영한 비디오를 ZIP으로 다운로드
  const handleExportVideos = async () => {
    const capturedCount = Object.keys(capturedVideos).length;
    
    if (capturedCount === 0) {
      alert('아직 촬영된 비디오가 없습니다.');
      return;
    }

    setIsExporting(true);

    try {
      // 1. 각 비디오를 개별 다운로드
      for (const [sceneId, videoBlob] of Object.entries(capturedVideos)) {
        const scene = scenes.find(s => s.id === parseInt(sceneId));
        const fileName = `${scene?.title || 'scene'}_${sceneId}.webm`;
        
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 다음 다운로드까지 약간 대기
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      alert(`${capturedCount}개의 비디오가 다운로드 되었습니다!`);
      setIsExported(true);
    } catch (error) {
      console.error('Export error:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 이메일로 전송 (서버 API 필요)
  const handleEmailVideos = async () => {
    const capturedCount = Object.keys(capturedVideos).length;
    
    if (capturedCount === 0) {
      alert('아직 촬영된 비디오가 없습니다.');
      return;
    }

    const email = prompt('비디오를 받을 이메일 주소를 입력하세요:');
    
    if (!email) return;

    setIsExporting(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      
      // 모든 비디오를 FormData에 추가
      for (const [sceneId, videoBlob] of Object.entries(capturedVideos)) {
        const scene = scenes.find(s => s.id === parseInt(sceneId));
        const fileName = `${scene?.title || 'scene'}_${sceneId}.webm`;
        formData.append('videos', videoBlob, fileName);
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이메일 전송에 실패했습니다.');
      }

      alert(`${email}로 비디오가 전송되었습니다!`);
      setIsExported(true);
    } catch (error: any) {
      console.error('Email error:', error);
      alert(error.message || '이메일 전송 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 레시피 저장하고 대시보드로 이동
  const handleSaveAndGoToDashboard = () => {
    // localStorage에 레시피 저장
    const savedRecipes = JSON.parse(localStorage.getItem('myRecipes') || '[]');
    
    const newRecipe = {
      id: Date.now(),
      videoUrl,
      createdAt: new Date().toISOString(),
      scenes,
      capturedCount: Object.keys(capturedVideos).length,
      totalScenes: scenes.length,
      capturedVideos: Object.keys(capturedVideos).reduce((acc, key) => {
        const sceneId = parseInt(key); // string을 number로 변환
        acc[sceneId] = true;
        return acc;
      }, {} as {[key: number]: boolean}),
      matchResults,
    };
    
    savedRecipes.push(newRecipe);
    localStorage.setItem('myRecipes', JSON.stringify(savedRecipes));
    
    // 대시보드로 이동
    window.location.href = '/dashboard?tab=recipes';
  };

  // 선택된 씨에서 디테일 화면
  if (selectedScene) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-black border-b border-gray-800 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4 text-white">
            <button
              onClick={handleCameraBack}
              className="flex items-center gap-2 font-semibold text-blue-400"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-400">slow mode</div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-center gap-4 py-4 bg-black">
          <button
            onClick={() => setActiveTab('recipe')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'recipe'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Recipe
          </button>
          <button
            onClick={() => setActiveTab('shooting')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'shooting'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Shooting
          </button>
        </div>

        {/* Content */}
        <div className="relative h-[calc(100vh-140px)]">
          {activeTab === 'recipe' ? (
            <RecipeVideoPlayer
              videoUrl={videoUrl}
              scene={selectedScene}
              onSwitchToShooting={() => setActiveTab('shooting')}
            />
          ) : (
            <CameraShooting
              sceneId={selectedScene.id}
              sceneTitle={selectedScene.title}
              instructions={[
                'Drop the phone from head to slightly under the chest',
                'Stop when your face is in the middle of the frame',
              ]}
              onCapture={handleVideoCapture}
              onBack={handleCameraBack}
              embedded={true}
            />
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 font-semibold hover:text-blue-600 transition-colors"
          >
            <span className="text-xl">←</span> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-xl" />
            <h1 className="text-xl font-bold">Parrot Kit</h1>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Recipe Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Recipe</h2>

        {/* Scenes List */}
        <div className="space-y-4">
          {scenes.map((scene) => {
            const isCaptured = capturedScenes[scene.id]; // 촬영 완료 여부
            
            return (
              <div
                key={scene.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                  isCaptured
                    ? 'border-4 border-green-500'
                    : 'border border-gray-200 hover:border-blue-300'
                }`}
              >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                  <img
                    src={scene.thumbnail}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                  />
                  {/* 촬영 완료 배지 */}
                  {isCaptured && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">
                        ✓
                      </div>
                    </div>
                  )}
                </div>

                {/* Scene Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      #{scene.id}: {scene.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {scene.startTime} ~ {scene.endTime}
                  </p>

                  <p className="text-sm text-gray-700 mb-3">
                    {scene.description}
                  </p>

                  {/* 버튼 */}
                  <div className="flex gap-2">
                    {isCaptured ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('이 씩을 다시 촬영하시겠습니까?')) {
                            handleSceneClick(scene);
                          }
                        }}
                        className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSceneClick(scene)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        🎥 Shoot
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleExportVideos}
            disabled={isExporting || Object.keys(capturedVideos).length === 0}
            className="py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '⏳ Exporting...' : `📥 Download Videos (${Object.keys(capturedVideos).length})`}
          </button>
          <button 
            onClick={handleEmailVideos}
            disabled={isExporting || Object.keys(capturedVideos).length === 0}
            className="py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📧 Email Videos
          </button>
        </div>

        {/* Progress Info */}
        {Object.keys(capturedVideos).length > 0 && (
          <div className="mt-4 text-center text-gray-600">
            ✅ {Object.keys(capturedVideos).length} / {scenes.length} scenes captured
          </div>
        )}

        {/* Next Button - Export 후에만 표시 */}
        {isExported && (
          <div className="mt-6">
            <button
              onClick={handleSaveAndGoToDashboard}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              ✅ Save Recipe & Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
