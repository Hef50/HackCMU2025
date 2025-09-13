import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          AccountaBuddy 💪
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Your personal fitness accountability companion. Join groups, track workouts, and stay motivated together.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
            Get Started
          </button>
          <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
            Learn More
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Set Goals</h3>
            <p className="text-gray-600">Define your fitness objectives and track your progress with personalized goal setting.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Join Groups</h3>
            <p className="text-gray-600">Connect with like-minded fitness enthusiasts and stay accountable together.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Log workouts, earn badges, and celebrate your fitness journey milestones.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Link 
            href="/auth"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started Today
          </Link>
          <p className="mt-4 text-gray-600">
            Join thousands of users achieving their fitness goals together
          </p>
        </div>
      </div>
    </div>
  );
}
