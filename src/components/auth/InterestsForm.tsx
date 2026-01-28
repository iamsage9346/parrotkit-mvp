'use client';

import React, { useState, useEffect } from 'react';
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

  // 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/signin');
    }
  }, [router]);

  const toggleInterest = (index: number) => {
    console.log('Toggle interest clicked:', index);
    console.log('Before update:', interests[index]);
    
    const updated = [...interests];
    updated[index] = {
      ...updated[index],
      selected: !updated[index].selected
    };
    
    console.log('After update:', updated[index]);
    setInterests(updated);
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '관심사 저장에 실패했습니다.');
      }

      // 성공 - 다음 페이지로 이동
      alert('관심사가 저장되었습니다!');
      router.push('/submit-video');
    } catch (err: any) {
      alert(err.message || '관심사 저장에 실패했습니다. 다시 시도해주세요.');
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
              style={{
                backgroundColor: interest.selected ? '#3B82F6' : '#FFFFFF',
                color: interest.selected ? '#FFFFFF' : '#374151',
                borderColor: interest.selected ? '#3B82F6' : '#D1D5DB',
              }}
              className={`py-2 px-4 rounded-full font-medium text-sm transition-all duration-200 border-2`}
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
