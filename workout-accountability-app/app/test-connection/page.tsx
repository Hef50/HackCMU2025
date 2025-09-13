'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        // Check if environment variables are available
        if (!supabaseUrl || !supabaseKey) {
          setConnectionStatus('❌ Error: Missing environment variables. Check your .env.local file.');
          return;
        }

        setConnectionStatus('🔄 Testing connection...');
        
        // Test basic connection
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .limit(5);

        if (error) {
          setConnectionStatus(`❌ Database Error: ${error.message}`);
          console.error('Supabase error:', error);
        } else {
          setConnectionStatus('✅ Supabase connection working!');
          setGoals(data || []);
        }
      } catch (err) {
        setConnectionStatus(`❌ Connection failed: ${err}`);
        console.error('Connection error:', err);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Connection Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
          <p className="text-lg">{connectionStatus}</p>
        </div>

        {goals.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Available Goals ({goals.length})</h2>
            <ul className="space-y-2">
              {goals.map((goal, index) => (
                <li key={goal.id || index} className="p-2 bg-gray-50 rounded">
                  {goal.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
