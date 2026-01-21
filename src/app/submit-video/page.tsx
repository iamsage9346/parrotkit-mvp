import { URLInputForm } from '@/components/auth';
import { TopNav } from '@/components/common';

export default function SubmitVideoPage() {
  return (
    <>
      <TopNav showNav={true} />
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 pt-24">
        <URLInputForm />
      </div>
    </>
  );
}
