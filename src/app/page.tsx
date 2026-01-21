'use client';

import Link from 'next/link';
import { Button, Card } from '@/components/common';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="text-center">
        <div className="mb-12">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-blue-400 via-yellow-300 to-red-500 rounded-full mb-4 flex items-center justify-center">
            <span className="text-3xl">🦜</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ParrotKit</h1>
          <p className="text-gray-600 text-sm">Viral Recipe for UCC Creators</p>
        </div>

        <div className="space-y-3">
          <Link href="/signin" className="block">
            <Button variant="primary">Sign In</Button>
          </Link>
          <Link href="/signup" className="block">
            <Button variant="secondary">Sign Up</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
