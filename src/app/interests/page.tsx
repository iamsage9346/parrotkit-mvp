import { InterestsForm } from '@/components/auth';
import { TopNav } from '@/components/common';

export default function InterestsPage() {
  return (
    <>
      <TopNav showNav={false} />
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <InterestsForm />
      </div>
    </>
  );
}
