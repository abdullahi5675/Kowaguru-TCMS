'use client';

import Link from 'next/link';
import RequestAccessForm from '../components/RequestAccessForm';

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-700 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3">
            <span className="text-white text-3xl font-bold font-serif -rotate-3">K</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Get Access to Kowaguru TCMS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-red-600 hover:text-red-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RequestAccessForm />
      </div>
    </div>
  );
}
