import { OnboardingForm } from '@/components/auth';
import { TopNav } from '@/components/common';

export default function OnboardingPage() {
  return (
    <>
      <TopNav showNav={false} />
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <OnboardingForm />
      </div>
    </>
  );
}
