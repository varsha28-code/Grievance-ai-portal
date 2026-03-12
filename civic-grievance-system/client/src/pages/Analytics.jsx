import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { fetchDashboardStats, fetchOfficerPerformance } from '../api';
import { FiTrendingUp, FiBarChart2, FiPieChart, FiUsers } from 'react-icons/fi';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const PRIORITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchOfficerPerformance()])
      .then(([s, o]) => {
        setStats(s);
        setOfficers(o);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'categories', label: 'Categories', icon: FiPieChart },
    { id: 'trends', label: 'Trends', icon: FiTrendingUp },
    { id: 'officers', label: 'Officers', icon: FiUsers },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
        <p className="text-gray-500 dark:text-gray-400">Data-driven insights for better civic governance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Complaint Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {stats.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.byPriority.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.priority] || COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Workload */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Department Workload</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byDepartment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="resolved" stackId="a" fill="#22c55e" name="Resolved" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Issues by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={stats.byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={120} label>
                    {stats.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {stats.byCategory.map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="flex-1 text-sm">{cat.category}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cat.count}</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${(cat.count / Math.max(...stats.byCategory.map(c => c.count))) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Complaint Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Insights */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🔮 AI-Driven Insights</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <InsightCard
                title="High Activity Zones"
                description="Koramangala and HSR Layout show 40% higher complaint rates. Consider preventive maintenance."
                type="warning"
              />
              <InsightCard
                title="Seasonal Pattern"
                description="Drainage complaints increase 3x during monsoon season. Pre-monsoon cleanup recommended."
                type="info"
              />
              <InsightCard
                title="Resolution Efficiency"
                description="Roads department resolution time improved by 25% this month compared to last month."
                type="success"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'officers' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Officer Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Officer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Resolved</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Pending</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Days</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map(officer => {
                    const rate = officer.total_assigned > 0 ? Math.round((officer.resolved / officer.total_assigned) * 100) : 0;
                    return (
                      <tr key={officer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">
                              {officer.name.charAt(0)}
                            </div>
                            <span className="font-medium">{officer.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{officer.department}</td>
                        <td className="py-3 px-4 text-center font-semibold">{officer.total_assigned}</td>
                        <td className="py-3 px-4 text-center text-green-600 font-semibold">{officer.resolved}</td>
                        <td className="py-3 px-4 text-center text-amber-600 font-semibold">{officer.pending}</td>
                        <td className="py-3 px-4 text-center">{officer.avg_resolution_days ? Math.round(officer.avg_resolution_days * 10) / 10 : '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className={`h-2 rounded-full ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ title, description, type }) {
  const colors = { warning: 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20', info: 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20', success: 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' };
  const icons = { warning: '⚠️', info: '💡', success: '✅' };
  return (
    <div className={`border rounded-lg p-4 ${colors[type]}`}>
      <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
        <span>{icons[type]}</span> {title}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
    </div>
  );
}
