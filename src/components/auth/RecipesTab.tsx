'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common';

export const Recipes: React.FC = () => {
  const [myRecipes, setMyRecipes] = useState<any[]>([]);

  useEffect(() => {
    // localStorage에서 레시피 불러오기
    const saved = localStorage.getItem('myRecipes');
    if (saved) {
      setMyRecipes(JSON.parse(saved));
    }
  }, []);

  const handleView = (recipe: any) => {
    // RecipeResult로 이동하기 위해 데이터를 sessionStorage에 저장
    sessionStorage.setItem('viewRecipe', JSON.stringify({
      scenes: recipe.scenes,
      videoUrl: recipe.videoUrl,
      capturedVideos: recipe.capturedVideos || {}, // 촬영 완료 데이터
      matchResults: recipe.matchResults || {}, // 매칭 결과
      recipeId: recipe.id, // 레시피 ID (업데이트용)
    }));
    
    // Home 탭으로 이동 (그곳에서 recipeData를 불러옴)
    window.location.href = '/dashboard?tab=home&view=recipe';
  };

  const handleDelete = (id: number) => {
    if (confirm('이 레시피를 삭제하시겠습니까?')) {
      const updated = myRecipes.filter(r => r.id !== id);
      setMyRecipes(updated);
      localStorage.setItem('myRecipes', JSON.stringify(updated));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Recipes</h1>
        <p className="text-gray-600">Your created video recipes</p>
      </div>

      {myRecipes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍿</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first video recipe by analyzing a URL!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard?tab=home'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Create Recipe
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRecipes.map((recipe) => {
            // YouTube URL에서 비디오 ID 추출
            const extractVideoId = (url: string) => {
              const patterns = [
                /shorts\/([a-zA-Z0-9_-]+)/,
                /watch\?v=([a-zA-Z0-9_-]+)/,
                /youtu\.be\/([a-zA-Z0-9_-]+)/,
              ];
              for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
              }
              return null;
            };
            
            const videoId = extractVideoId(recipe.videoUrl);
            const thumbnailUrl = videoId 
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : null;

            return (
              <Card key={recipe.id}>
                {thumbnailUrl ? (
                  <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={thumbnailUrl} 
                      alt={`Recipe #${recipe.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 썸네일 로드 실패 시 fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"><div class="text-white text-4xl">🎥</div></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-white text-4xl">🎥</div>
                  </div>
                )}
              
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Video Recipe #{recipe.id}
                </h3>
              
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>📅 {new Date(recipe.createdAt).toLocaleDateString()}</p>
                  <p>🎬 {recipe.capturedCount} / {recipe.totalScenes} scenes</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(recipe)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
