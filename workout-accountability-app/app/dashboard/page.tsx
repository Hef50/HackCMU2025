export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to AccountaBuddy! 🎉
        </h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">
            Congratulations! You've successfully completed the onboarding process.
            Your fitness journey with AccountaBuddy starts here.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✅ Profile setup complete
            </p>
            <p className="text-green-600 text-sm mt-1">
              You can now explore groups, track workouts, and stay accountable to your fitness goals!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
