'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import type { Database } from '@/lib/types';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Backdoor authentication for testing
      if (!isSignUp && email === 'test2@example.com' && password === 'test2123') {
        // Set multiple cookies to ensure persistence
        document.cookie = 'backdoor_test=true; path=/; max-age=86400; SameSite=Lax';
        document.cookie = 'backdoor_user=test2@example.com; path=/; max-age=86400; SameSite=Lax';
        
        // Also set in localStorage as backup
        localStorage.setItem('backdoor_test', 'true');
        localStorage.setItem('backdoor_user', 'test2@example.com');
        
        setError(null);
        console.log('Using backdoor authentication - bypassing Supabase');
        console.log('Cookies set:', document.cookie);
        
        // Add a small delay to ensure cookies are set
        setTimeout(() => {
          router.push('/onboarding');
        }, 100);
        return;
      }

      if (isSignUp) {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              full_name: name
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user) {
          // Redirect to onboarding after successful signup
          router.push('/onboarding');
        }
      } else {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (data.user) {
          // Check if user has completed onboarding
          const { data: userProfile } = await supabase
            .from('users')
            .select('has_completed_tutorial')
            .eq('id', data.user.id)
            .single();

          if (userProfile?.has_completed_tutorial) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      console.log('Full error object:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full glass rounded-3xl border border-slate-600/50 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <GroupGainzLogo size={56} showText={true} />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-300">
            {isSignUp ? 'Start your fitness journey today' : 'Sign in to continue your journey'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required={isSignUp}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
