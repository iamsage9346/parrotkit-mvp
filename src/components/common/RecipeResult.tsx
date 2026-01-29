'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CameraShooting } from './CameraShooting';
import { RecipeVideoPlayer } from './RecipeVideoPlayer';

interface RecipeScene {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  thumbnail: string;
  description: string;
  script?: string[];
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
  const [sceneScripts, setSceneScripts] = useState<{[key: number]: string[]}>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant'; content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(50);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const defaultScripts: {[key: number]: string[]} = {
    1: [
      'Most people still don\'t know this... you NEED to hear this',
      '(Look at the camera with confidence)',
      'Slightly surprised expression + spark curiosity',
    ],
    2: [
      'Hey everyone, today I\'m sharing a tip you absolutely need to know',
      '(Start with a natural greeting)',
      'Relaxed, friendly tone',
    ],
    3: [
      'I was skeptical at first, but after trying it myself, it actually works',
      '(Share your experience honestly)',
      'Relatable expression + nodding',
    ],
    4: [
      'Okay, here\'s the key part. Just follow this and you\'re set',
      '(Emphasize the main point clearly)',
      'Point with finger or gesture at screen',
    ],
    5: [
      'And that\'s it! Easier than you thought, right?',
      '(Wrap up with an upbeat tone)',
      'Satisfied expression, nod and smile',
    ],
    6: [
      'If this helped, hit like and follow!',
      'More great tips coming soon!',
      '(Wave and give a closing smile)',
    ],
  };

  const getScriptForScene = (scene: RecipeScene): string[] => {
    if (sceneScripts[scene.id]) return sceneScripts[scene.id];
    if (scene.script && scene.script.length > 0) return scene.script;
    return defaultScripts[scene.id] || [scene.description];
  };

  const parseScriptLines = (text: string): string[] | null => {
    const lines = text.split('\n');
    const numbered: string[] = [];
    for (const line of lines) {
      const match = line.match(/^\s*(\d+)\.\s+(.+)/);
      if (match) {
        numbered.push(match[2].trim());
      }
    }
    return numbered.length >= 2 ? numbered : null;
  };

  const applyScript = (messageContent: string) => {
    if (!selectedScene) return;
    const lines = parseScriptLines(messageContent);
    if (lines) {
      setSceneScripts(prev => ({ ...prev, [selectedScene.id]: lines }));
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || chatLoading) return;
    const userMsg = chatMessage.trim();
    setChatMessage('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newHistory);
    setChatLoading(true);

    setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' }), 50);

    const currentScript = selectedScene ? getScriptForScene(selectedScene) : [];
    const payload = {
      messages: newHistory,
      scenes: scenes.map(s => ({ id: s.id, title: s.title, startTime: s.startTime, endTime: s.endTime, description: s.description })),
      currentScene: selectedScene ? {
        id: selectedScene.id,
        title: selectedScene.title,
        description: selectedScene.description,
        script: currentScript,
      } : null,
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.message) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error: ' + (data.error || 'Failed to get response') }]);
      }
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
    }
  };

  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startY: clientY, startHeight: sheetHeight };
  }, [sheetHeight]);

  const handleDragMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!dragRef.current) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = dragRef.current.startY - clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(90, Math.max(20, dragRef.current.startHeight + deltaPercent));
    setSheetHeight(newHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    // Snap to close if dragged below 15%
    if (sheetHeight < 15) {
      setChatOpen(false);
      setSheetHeight(50);
    }
    dragRef.current = null;
  }, [sheetHeight]);

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
      <div className="h-screen flex flex-col bg-black overflow-hidden">
        {/* Header */}
        <div className="bg-black border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button
              onClick={handleCameraBack}
              className="flex items-center gap-2 font-semibold text-blue-400"
            >
              ← Back
            </button>
            <span className="text-sm font-medium">#{selectedScene.id}: {selectedScene.title}</span>
            <div className="text-sm text-gray-400">slow mode</div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-center gap-4 py-2 bg-black flex-shrink-0">
          <button
            onClick={() => setActiveTab('recipe')}
            className={`px-6 py-1.5 rounded-full font-medium transition-all text-sm ${
              activeTab === 'recipe'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Recipe
          </button>
          <button
            onClick={() => setActiveTab('shooting')}
            className={`px-6 py-1.5 rounded-full font-medium transition-all text-sm ${
              activeTab === 'shooting'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Shooting
          </button>
        </div>

        {/* Content - fills remaining space */}
        <div className="flex-1 relative overflow-hidden">
          {activeTab === 'recipe' ? (
            <RecipeVideoPlayer
              videoUrl={videoUrl}
              scene={selectedScene}
              scriptLines={getScriptForScene(selectedScene)}
              onSwitchToShooting={() => setActiveTab('shooting')}
            />
          ) : (
            <CameraShooting
              sceneId={selectedScene.id}
              sceneTitle={selectedScene.title}
              instructions={getScriptForScene(selectedScene)}
              onCapture={handleVideoCapture}
              onBack={handleCameraBack}
              embedded={true}
            />
          )}
        </div>

        {/* Floating Chatbot Button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110 flex items-center justify-center z-50"
          >
            <img src="/parrot-logo.png" alt="Chat" className="w-8 h-8" />
          </button>
        )}

        {/* Chatbot Bottom Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
            chatOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: `${sheetHeight}vh` }}
        >
          {chatOpen && (
            <div
              className="fixed inset-0 bg-black/30 -z-10"
              onClick={() => { setChatOpen(false); setSheetHeight(50); }}
            />
          )}
          <div className="h-full bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
            <div
              className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <img src="/parrot-logo.png" alt="Parrot Kit" className="w-7 h-7" />
                <span className="font-bold text-gray-900 text-lg">Script Assistant</span>
              </div>
              <button
                onClick={() => { setChatOpen(false); setSheetHeight(50); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                <p className="text-sm text-gray-700">
                  Hi! I&apos;m editing the script for <strong>#{selectedScene.id}: {selectedScene.title}</strong>. Ask me to rewrite, shorten, or change the tone!
                </p>
              </div>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && parseScriptLines(msg.content) && (
                    <button
                      onClick={() => applyScript(msg.content)}
                      className="mt-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold hover:bg-green-600 transition-colors"
                    >
                      Apply to Script
                    </button>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 p-4 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                placeholder="Ask about scripts..."
                disabled={chatLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all disabled:opacity-50"
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatMessage.trim()}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b z-10 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 font-semibold hover:text-blue-600 transition-colors"
          >
            <span className="text-xl">←</span> Back
          </button>
          <div className="flex items-center gap-2">
            <img src="/parrot-logo.png" alt="Parrot Kit" className="w-8 h-8" />
            <h1 className="text-lg font-bold">Parrot Kit</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {Object.keys(capturedVideos).length > 0 && (
              <span>{Object.keys(capturedVideos).length}/{scenes.length} captured</span>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Content - fits in one viewport */}
      <div className="flex-1 overflow-hidden px-3 pb-2 pt-2 md:p-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Recipe</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportVideos}
                disabled={isExporting || Object.keys(capturedVideos).length === 0}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isExporting ? 'Exporting...' : `Download (${Object.keys(capturedVideos).length})`}
              </button>
              {isExported && (
                <button
                  onClick={handleSaveAndGoToDashboard}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-all"
                >
                  Save & Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Scenes Grid - compact, fits in one screen */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 flex-1 auto-rows-fr">
            {scenes.map((scene) => {
              const isCaptured = capturedScenes[scene.id];

              return (
                <div
                  key={scene.id}
                  onClick={() => handleSceneClick(scene)}
                  className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col ${
                    isCaptured
                      ? 'ring-2 ring-green-500'
                      : 'border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-1 min-h-0 overflow-hidden">
                    <img
                      src={scene.thumbnail}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    {isCaptured && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                      {scene.startTime}
                    </div>
                  </div>

                  {/* Scene Info - minimal */}
                  <div className="px-2 py-1.5 flex items-center justify-between gap-1 flex-shrink-0">
                    <h3 className="font-semibold text-[11px] text-gray-900 truncate">
                      #{scene.id} {scene.title}
                    </h3>
                    {isCaptured ? (
                      <span className="text-[10px] text-green-600 font-medium flex-shrink-0">Done</span>
                    ) : (
                      <span className="text-[10px] text-blue-500 font-medium flex-shrink-0">Shoot</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110 flex items-center justify-center z-50"
        >
          <img src="/parrot-logo.png" alt="Chat" className="w-8 h-8" />
        </button>
      )}

      {/* Chatbot Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          chatOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: `${sheetHeight}vh` }}
      >
        {/* Backdrop */}
        {chatOpen && (
          <div
            className="fixed inset-0 bg-black/30 -z-10"
            onClick={() => { setChatOpen(false); setSheetHeight(50); }}
          />
        )}

        <div className="h-full bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Drag Handle */}
          <div
            className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>
          </div>

          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src="/parrot-logo.png" alt="Parrot Kit" className="w-7 h-7" />
              <span className="font-bold text-gray-900 text-lg">Script Assistant</span>
            </div>
            <button
              onClick={() => { setChatOpen(false); setSheetHeight(50); }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Chat Messages - scrollable */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome message */}
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-[85%]">
              <p className="text-sm text-gray-700">
                Hi! I&apos;m your Script Assistant. I can help you write and refine scripts for each scene. Try:
              </p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>&bull; &quot;Write a script for Scene #1 Hook&quot;</li>
                <li>&bull; &quot;Make the intro more engaging&quot;</li>
                <li>&bull; &quot;Suggest a funny voiceover for all scenes&quot;</li>
              </ul>
            </div>

            {/* Chat history */}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-100 p-4 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
              placeholder="Ask about scripts..."
              disabled={chatLoading}
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all disabled:opacity-50"
            />
            <button
              onClick={sendChatMessage}
              disabled={chatLoading || !chatMessage.trim()}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
