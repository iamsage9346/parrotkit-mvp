'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/common';
import { SignInFormData } from '@/types/auth';

export const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 기본 유효성 검사
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요');
      setLoading(false);
      return;
    }

    try {
      // TODO: API 호출 추가 (DB 연결 후)
      console.log('Sign in data:', formData);
      // const response = await fetch('/api/auth/signin', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // const data = await response.json();
      // if (data.success) {
      //   // 대시보드로 리다이렉트
      // }
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
        <p className="text-gray-600">Welcome back !</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Username or email address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Submit'}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 text-sm mb-4">
          <Link href="#" className="text-blue-500 hover:underline font-semibold">
            Forgot your password?
          </Link>
        </p>
        <p className="text-gray-600 text-sm">
          Don't have an account yet?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </Card>
  );
};
