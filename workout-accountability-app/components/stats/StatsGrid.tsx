import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { GroupStats } from '@/app/dashboard/groups/[groupId]/stats/actions';

interface StatsGridProps {
  stats: GroupStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  // Prepare data for charts
  const attendanceData = [
    { name: 'Completed', value: stats.total_workouts_completed, color: '#3b82f6' },
    { name: 'Missed', value: Math.max(0, stats.total_scheduled_workouts - stats.total_workouts_completed), color: '#64748b' }
  ];

  const activityData = [
    { name: 'Photos', value: stats.photos_shared, color: '#10b981' },
    { name: 'Kudos', value: stats.total_kudos_received, color: '#f59e0b' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-slate-300">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Workouts */}
        <div className="glass rounded-2xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total_workouts_completed}</p>
              <p className="text-xs text-slate-400">Workouts</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="glass rounded-2xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.current_streak}</p>
              <p className="text-xs text-slate-400">Streak</p>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="glass rounded-2xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.group_attendance_rate}%</p>
              <p className="text-xs text-slate-400">Attendance</p>
            </div>
          </div>
        </div>

        {/* Members Count */}
        <div className="glass rounded-2xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.members_count}</p>
              <p className="text-xs text-slate-400">Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="glass rounded-3xl p-6 border border-slate-600/50">
        <h3 className="text-lg font-bold text-white mb-6">Performance Overview</h3>
        
        <div className="space-y-6">
          {/* Attendance Chart */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-4">Workout Completion</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              {attendanceData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-4">Social Activity</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {(stats.most_active_member || stats.best_attendance_member) && (
        <div className="glass rounded-3xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-6">Top Performers</h3>
          
          <div className="space-y-4">
            {stats.most_active_member && (
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Most Active</p>
                    <p className="text-sm text-slate-400">{stats.most_active_member}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">Highest check-ins</p>
                </div>
              </div>
            )}

            {stats.best_attendance_member && (
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Best Attendance</p>
                    <p className="text-sm text-slate-400">{stats.best_attendance_member}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">Highest rate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
