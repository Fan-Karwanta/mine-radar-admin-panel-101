import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Database, AlertTriangle, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import adminService from '../services/adminService';

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardAnalytics();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "text-white" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  const formatChartData = (data, labelKey, valueKey) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      name: item[labelKey] || 'Unknown',
      value: item[valueKey] || 0
    }));
  };

  const formatMonthlyData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      month: `${item._id?.month || 0}/${item._id?.year || 2024}`,
      reports: item.count || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Failed to load dashboard data</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const reportStatusData = formatChartData(analytics.reportsByStatus, '_id', 'count');
  const reportTypeData = formatChartData(analytics.reportsByType, '_id', 'count');
  const userRoleData = formatChartData(analytics.usersByRole, '_id', 'count');
  const monthlyReportsData = formatMonthlyData(analytics.reportsByMonth);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mine Radar Dashboard</h1>
        <p className="text-gray-400">Monitor mining violation reports and user activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.totals?.users || 0}
          icon={Users}
          color="text-blue-400"
        />
        <StatCard
          title="Total Reports"
          value={analytics.totals?.reports || 0}
          icon={FileText}
          color="text-green-400"
        />
        <StatCard
          title="National Directory"
          value={analytics.totals?.nationalDirectory || 0}
          icon={Database}
          color="text-purple-400"
        />
        <StatCard
          title="Local Directory"
          value={analytics.totals?.localDirectory || 0}
          icon={MapPin}
          color="text-yellow-400"
        />
        <StatCard
          title="Hotspots"
          value={analytics.totals?.hotspots || 0}
          icon={AlertTriangle}
          color="text-red-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Reports by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Reports by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Reports by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Monthly Reports Trend & User Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Reports Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyReportsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="reports" 
                stroke="#06B6D4" 
                strokeWidth={2}
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Report ID</th>
                <th className="text-left py-3 px-4 text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-400">Submitted By</th>
                <th className="text-left py-3 px-4 text-gray-400">Location</th>
                <th className="text-left py-3 px-4 text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentReports?.map((report, index) => (
                <tr key={report._id || index} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="py-3 px-4 text-white font-mono">{report.reportId}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {report.reportType?.replace('illegal_', '').replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                      report.status === 'under_investigation' ? 'bg-blue-900 text-blue-300' :
                      report.status === 'resolved' ? 'bg-green-900 text-green-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{report.submittedBy}</td>
                  <td className="py-3 px-4 text-gray-300">{report.location}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
