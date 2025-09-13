import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-6">
            <GroupGainzLogo size={48} showText={true} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-3">Welcome to GroupGainz!</h1>
            <p className="text-slate-300">Your fitness journey starts here</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="glass rounded-3xl p-8 border border-slate-600/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Profile Setup Complete!</h2>
            <p className="text-slate-300 mb-6">
              Congratulations! You've successfully completed the onboarding process.
              Your fitness journey with GroupGainz starts here.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-300 font-medium">Profile setup complete</p>
                  <p className="text-green-400 text-sm">Ready to join groups and track workouts!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/dashboard/groups" 
              className="block w-full gradient-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth text-center"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Explore Groups</span>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/location-tracker" 
              className="block w-full bg-slate-800/50 text-slate-300 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-700/50 transition-colors text-center"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Location Tracker</span>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/groups/actions" 
              className="block w-full bg-slate-800/50 text-slate-300 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-700/50 transition-colors text-center"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create New Group</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
