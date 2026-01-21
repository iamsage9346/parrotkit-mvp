'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/common';
import { InterestCategory, INTEREST_CATEGORIES } from '@/types/auth';

interface InterestTag {
  category: InterestCategory;
  selected: boolean;
}

export const InterestsForm: React.FC = () => {
  const router = useRouter();
  const [interests, setInterests] = useState<InterestTag[]>(
    INTEREST_CATEGORIES.map(category => ({
      category,
      selected: false,
    }))
  );

  const [loading, setLoading] = useState(false);

  const toggleInterest = (index: number) => {
    setInterests(prev => {
      const updated = [...prev];
      updated[index].selected = !updated[index].selected;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selectedInterests = interests
      .filter(interest => interest.selected)
      .map(interest => interest.category);

    if (selectedInterests.length === 0) {
      alert('최소 하나 이상의 관심사를 선택해주세요');
      setLoading(false);
      return;
    }

    try {
      // TODO: API 호출 추가 (관심사 저장 후 영상 제출 페이지로 이동)
      console.log('Selected interests:', selectedInterests);
      // const response = await fetch('/api/user/interests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ interests: selectedInterests }),
      // });
      // if (response.ok) {
      router.push('/submit-video');
      // }
    } catch (err) {
      alert('관심사 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = interests.filter(i => i.selected).length;

  return (
    <Card className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your interests</h1>
        <p className="text-gray-600 text-sm">
          Select a few genres to help us tailor reference recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {interests.map((interest, index) => (
            <button
              key={interest.category}
              type="button"
              onClick={() => toggleInterest(index)}
              className={`py-2 px-4 rounded-full font-medium text-sm transition-all duration-200 border-2 ${
                interest.selected
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {interest.category}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-6 text-center">
          {selectedCount} 개 선택됨
        </div>

        <Button type="submit" disabled={loading || selectedCount === 0}>
          {loading ? 'Saving...' : 'Submit'}
        </Button>
      </form>
    </Card>
  );
};
