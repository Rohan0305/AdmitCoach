'use client';

import { useState } from 'react';
import useAuthUser from '@/app/zustand/useAuthUser';
import CreditPurchase from './CreditPurchase';

export default function CreditDisplay() {
  const { user } = useAuthUser();
  const [showPurchase, setShowPurchase] = useState(false);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Interview Credits
        </h2>
        <button
          onClick={() => setShowPurchase(!showPurchase)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {showPurchase ? 'Hide Purchase Options' : 'Buy More Credits'}
        </button>
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-3xl font-bold text-blue-600">
          {user.credits || 0}
        </div>
        <div className="text-gray-600">
          credits remaining
        </div>
      </div>
      
      {user.credits === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No credits available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You need interview credits to start a mock interview. Purchase credits below to get started.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showPurchase && <CreditPurchase />}
    </div>
  );
} 