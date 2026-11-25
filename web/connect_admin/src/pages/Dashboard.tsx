import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Users, Compass, CalendarCheck, ShieldAlert } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Active Guides', value: '42', change: '+12% this month', icon: Users, color: 'text-orange-600' },
    { label: 'Published Tours', value: '128', change: '+8 new', icon: Compass, color: 'text-blue-600' },
    { label: 'Completed Bookings', value: '384', change: 'Zero disputes', icon: CalendarCheck, color: 'text-green-600' },
    { label: 'Pending Verifications', value: '5', change: 'Requires review', icon: ShieldAlert, color: 'text-amber-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time platform metrics, verification queues, and system health
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">{s.label}</span>
                  <Icon size={20} className={s.color} />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{s.value}</span>
                </div>
                <div className="mt-2 text-xs font-medium text-gray-400">{s.change}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Platform Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Verification & Moderation Alerts</h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
              System Live
            </span>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Guide Verification Submission</div>
                <div className="text-xs text-gray-500 mt-0.5">Pasang Sherpa submitted identity certificates</div>
              </div>
              <a
                href="/verifications"
                className="px-3 py-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                Review Now
              </a>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">New Tour Created</div>
                <div className="text-xs text-gray-500 mt-0.5">Sunita Gurung published &quot;Pokhara Peace Pagoda Hike&quot;</div>
              </div>
              <span className="text-xs text-gray-400 font-medium">Auto-approved (verified guide)</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
