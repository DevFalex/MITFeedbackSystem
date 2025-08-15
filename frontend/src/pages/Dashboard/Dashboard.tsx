import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReactApexChart from 'react-apexcharts';

interface Metrics {
  total: number;
  pending: number;
  resolved: number;
  avgResolution: string;
  unassigned?: number;
  assignedToMe?: number;
}

interface Feedback {
  id: number;
  type: string;
  category: string;
  submittedBy: string;
  status: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [statusChart, setStatusChart] = useState<{
    options: any;
    series: number[];
  } | null>(null);
  const [categoryChart, setCategoryChart] = useState<{
    options: any;
    series: number[];
  } | null>(null);

  const fetchDashboardData = () => {
    // Simulated metrics — replace with API call
    setMetrics({
      total: 120,
      pending: 35,
      resolved: 75,
      avgResolution: '2 days',
      unassigned:
        user?.role === 'ADMIN' || user?.role === 'MIT_CORDINATOR'
          ? 5
          : undefined,
      assignedToMe: user?.role === 'LECTURER' ? 8 : undefined,
    });

    // Simulated recent feedback — replace with API call
    setRecentFeedback([
      {
        id: 1,
        type: 'Complaint',
        category: 'Academic',
        submittedBy: 'John Doe',
        status: 'Pending',
        date: '2025-08-07',
      },
      {
        id: 2,
        type: 'Suggestion',
        category: 'Facility',
        submittedBy: 'Anonymous',
        status: 'Resolved',
        date: '2025-08-06',
      },
      {
        id: 3,
        type: 'Compliment',
        category: 'Welfare',
        submittedBy: 'Jane Smith',
        status: 'Open',
        date: '2025-08-05',
      },
    ]);

    setStatusChart({
      options: {
        chart: { type: 'donut' },
        labels: ['Open', 'Pending', 'Resolved'],
        colors: ['#f87171', '#fbbf24', '#34d399'],
        legend: { position: 'bottom' },
      },
      series: [10, 35, 75],
    });

    setCategoryChart({
      options: {
        chart: { type: 'bar' },
        xaxis: {
          categories: ['Academic', 'Facility', 'Welfare', 'Technology'],
        },
        colors: ['#60a5fa', '#fbbf24', '#a78bfa', '#34d399'],
        plotOptions: { bar: { distributed: true, columnWidth: '50%' } },
        dataLabels: { enabled: false },
      },
      series: [
        {
          name: 'Feedback Count',
          data: [40, 25, 30, 25],
        },
      ],
    } as any);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold">Welcome, {user?.username}!</h1>
        <p>
          Email: <b>{user?.email}</b>
        </p>
        <p>
          Role: <b>{user?.role}</b>
        </p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="text-sm">Total Feedback</h3>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </div>
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="text-sm">Pending</h3>
            <p className="text-2xl font-bold">{metrics.pending}</p>
          </div>
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="text-sm">Resolved</h3>
            <p className="text-2xl font-bold">{metrics.resolved}</p>
          </div>
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="text-sm">Avg. Resolution Time</h3>
            <p className="text-2xl font-bold">{metrics.avgResolution}</p>
          </div>

          {metrics.unassigned !== undefined && (
            <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
              <h3 className="text-sm">Unassigned</h3>
              <p className="text-2xl font-bold">{metrics.unassigned}</p>
            </div>
          )}
          {metrics.assignedToMe !== undefined && (
            <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
              <h3 className="text-sm">Assigned to Me</h3>
              <p className="text-2xl font-bold">{metrics.assignedToMe}</p>
            </div>
          )}
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="text-sm">Group Project</h3>
            <p className="text-2xl font-bold">MIT 811 GRP 6</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusChart && (
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="mb-4 font-semibold">Feedback Status</h3>
            <ReactApexChart
              options={statusChart!.options}
              series={statusChart!.series}
              type="donut"
              height={300}
            />
          </div>
        )}
        {categoryChart && (
          <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
            <h3 className="mb-4 font-semibold">Feedback by Category</h3>
            <ReactApexChart
              options={categoryChart!.options}
              series={categoryChart!.series}
              type="bar"
              height={300}
            />
          </div>
        )}
      </div>

      {/* Recent Feedback Table */}
      <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
        <h3 className="mb-4 font-semibold">Recent Feedback</h3>
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-boxdark-2">
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Submitted By</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentFeedback.map((fb) => (
              <tr key={fb.id}>
                <td className="p-2 border">{fb.type}</td>
                <td className="p-2 border">{fb.category}</td>
                <td className="p-2 border">{fb.submittedBy}</td>
                <td className="p-2 border">{fb.status}</td>
                <td className="p-2 border">{fb.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-boxdark p-4 rounded shadow">
        <h3 className="mb-4 font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit Feedback
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            View My Feedback
          </button>
          {(user?.role === 'ADMIN' ||
            user?.role === 'MIT_CORDINATOR' ||
            user?.role === 'LECTURER') && (
            <>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded">
                View All Feedback
              </button>
              <button className="bg-purple-500 text-white px-4 py-2 rounded">
                Update Feedback Status
              </button>
              {user?.role === 'ADMIN' && (
                <button className="bg-red-500 text-white px-4 py-2 rounded">
                  Manage Users
                </button>
              )}
            </>
          )}
          <button className="bg-gray-500 text-white px-4 py-2 rounded">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
