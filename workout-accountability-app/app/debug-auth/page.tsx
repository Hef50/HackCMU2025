'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/types';

export default function DebugAuthPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClientComponentClient<Database>();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    clearResults();
    
    try {
      addResult('🔄 Testing Supabase connection...');
      
      // Test basic connection
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .limit(1);
        
      if (goalsError) {
        addResult(`❌ Goals table error: ${goalsError.message}`);
      } else {
        addResult(`✅ Goals table accessible (${goals?.length || 0} records)`);
      }

      // Test auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else if (session) {
        addResult(`✅ User is logged in: ${session.user.email}`);
      } else {
        addResult('ℹ️ No active session (user not logged in)');
      }

      // Test users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .limit(3);
        
      if (usersError) {
        addResult(`❌ Users table error: ${usersError.message}`);
      } else {
        addResult(`✅ Users table accessible (${users?.length || 0} records)`);
        if (users && users.length > 0) {
          users.forEach(user => {
            addResult(`   - ${user.email} (${user.name})`);
          });
        }
      }
      
    } catch (err: any) {
      addResult(`❌ Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    setIsLoading(true);
    
    try {
      addResult('🔄 Creating test user...');
      
      const testEmail = 'test@example.com';
      const testPassword = 'testpass123';
      const testName = 'Test User';
      
      // Try to sign up
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: testName,
            full_name: testName
          }
        }
      });

      if (error) {
        addResult(`❌ Signup error: ${error.message}`);
      } else if (data.user) {
        addResult(`✅ Test user created successfully!`);
        addResult(`   Email: ${testEmail}`);
        addResult(`   Password: ${testPassword}`);
        addResult(`   User ID: ${data.user.id}`);
        
        if (data.user.email_confirmed_at) {
          addResult('✅ Email confirmed automatically');
        } else {
          addResult('⚠️ Email confirmation required (check your email)');
        }
      }
      
    } catch (err: any) {
      addResult(`❌ Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    
    try {
      addResult('🔄 Testing login with test@example.com...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpass123',
      });

      if (error) {
        addResult(`❌ Login error: ${error.message}`);
      } else if (data.user) {
        addResult(`✅ Login successful!`);
        addResult(`   User: ${data.user.email}`);
        addResult(`   ID: ${data.user.id}`);
      }
      
    } catch (err: any) {
      addResult(`❌ Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Authentication Debug</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
            <div className="space-y-3">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Test Supabase Connection
              </button>
              
              <button
                onClick={createTestUser}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Create Test User
              </button>
              
              <button
                onClick={testLogin}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Test Login
              </button>
              
              <button
                onClick={clearResults}
                disabled={isLoading}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Clear Results
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Test Credentials:</strong><br />
                Email: test@example.com<br />
                Password: testpass123
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>🚪 Backdoor Access (No Auth Required):</strong><br />
                Email: test2@example.com<br />
                Password: test2123<br />
                <em>Bypasses all authentication for testing</em>
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">Click a debug action to see results...</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/auth" 
            className="text-blue-600 hover:text-blue-800 underline mr-4"
          >
            ← Back to Auth
          </a>
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
