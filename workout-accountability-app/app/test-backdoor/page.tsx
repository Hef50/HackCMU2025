'use client';

import { useEffect, useState } from 'react';

export default function TestBackdoorPage() {
  const [cookieInfo, setCookieInfo] = useState<any>({});
  const [localStorageInfo, setLocalStorageInfo] = useState<any>({});

  useEffect(() => {
    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    setCookieInfo(cookies);

    // Check localStorage
    const localStorage = {
      backdoor_test: window.localStorage.getItem('backdoor_test'),
      backdoor_user: window.localStorage.getItem('backdoor_user')
    };

    setLocalStorageInfo(localStorage);
  }, []);

  const clearBackdoor = () => {
    // Clear cookies
    document.cookie = 'backdoor_test=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'backdoor_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear localStorage
    window.localStorage.removeItem('backdoor_test');
    window.localStorage.removeItem('backdoor_user');
    
    // Refresh the page
    window.location.reload();
  };

  const setBackdoor = () => {
    // Set cookies
    document.cookie = 'backdoor_test=true; path=/; max-age=86400; SameSite=Lax';
    document.cookie = 'backdoor_user=test2@example.com; path=/; max-age=86400; SameSite=Lax';
    
    // Set localStorage
    window.localStorage.setItem('backdoor_test', 'true');
    window.localStorage.setItem('backdoor_user', 'test2@example.com');
    
    // Refresh the page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Backdoor Test Page</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cookie Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Cookie Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">backdoor_test:</span>
                <span className={cookieInfo.backdoor_test === 'true' ? 'text-green-600' : 'text-red-600'}>
                  {cookieInfo.backdoor_test || 'Not Set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">backdoor_user:</span>
                <span className={cookieInfo.backdoor_user ? 'text-green-600' : 'text-red-600'}>
                  {cookieInfo.backdoor_user || 'Not Set'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <strong>All Cookies:</strong>
              <pre className="mt-2 whitespace-pre-wrap">{document.cookie || 'No cookies'}</pre>
            </div>
          </div>

          {/* LocalStorage Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">LocalStorage Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">backdoor_test:</span>
                <span className={localStorageInfo.backdoor_test === 'true' ? 'text-green-600' : 'text-red-600'}>
                  {localStorageInfo.backdoor_test || 'Not Set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">backdoor_user:</span>
                <span className={localStorageInfo.backdoor_user ? 'text-green-600' : 'text-red-600'}>
                  {localStorageInfo.backdoor_user || 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={setBackdoor}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Set Backdoor
            </button>
            <button
              onClick={clearBackdoor}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Backdoor
            </button>
            <a
              href="/auth"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Auth
            </a>
            <a
              href="/onboarding"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Onboarding
            </a>
            <a
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">Test Instructions:</h3>
          <ol className="mt-2 text-yellow-700 list-decimal list-inside space-y-1">
            <li>Click "Set Backdoor" to manually set the backdoor authentication</li>
            <li>Try navigating to different pages to test the flow</li>
            <li>Use "Clear Backdoor" to reset and test normal authentication</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
