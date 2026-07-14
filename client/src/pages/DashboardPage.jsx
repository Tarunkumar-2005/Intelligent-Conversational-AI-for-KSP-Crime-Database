import React from 'react';
import { PageContainer, PageHeader, StatCard, DashboardCard } from '../components/LayoutComponents.jsx';
import { Badge, Button } from '../components/UIPrimitives.jsx';
import { useUI } from '../context/UIContext.jsx';

const DashboardPage = () => {
  const { addNotification } = useUI();

  const handleSyncData = () => {
    addNotification('success', 'Database synchronization complete. 12 new FIR entries parsed.');
  };

  const categories = [
    { name: 'Theft (THF)', weight: '25%', count: 75, color: 'bg-blue-500' },
    { name: 'Cyber Crime (CYB)', weight: '18%', count: 54, color: 'bg-cyan-500' },
    { name: 'Fraud & Scams (FRD)', weight: '15%', count: 45, color: 'bg-purple-500' },
    { name: 'Robbery (ROB)', weight: '12%', count: 36, color: 'bg-yellow-500' },
    { name: 'Assault (AST)', weight: '10%', count: 30, color: 'bg-orange-500' },
    { name: 'Others', weight: '20%', count: 60, color: 'bg-slate-400' },
  ];

  const recentAlerts = [
    { id: 1, type: 'critical', title: 'Homicide Reported (BNS 103)', time: '10 mins ago', desc: 'Halasuru Police Station registered a homicide occurrence in residential zone.' },
    { id: 2, type: 'high', title: 'Cyber Extortion Scam Alert', time: '1 hr ago', desc: 'Indiranagar reported a massive Telegram part-time job job scam targeting IT professionals.' },
    { id: 3, type: 'medium', title: 'Repeat Offender Absconded', time: '3 hrs ago', desc: 'Offender Shekhar (KGS Gang) reported absent during local probation registry check.' },
  ];

  const activities = [
    { time: '14:02:11', user: 'Inspector Shekhar', act: 'Registered new FIR case FIR/KSP-BLR-HAL-01/2026/0045.' },
    { time: '13:54:50', user: 'Analyst Raman', act: 'Exported prediction trends report for Mysuru City Division.' },
    { time: '12:44:02', user: 'System Agent', act: 'Generated automated network relationship link for MSM Gang.' },
    { time: '11:15:30', user: 'Supervisor Gowda', act: 'Authorized case closed for theft case FIR/KSP-MNY-CEN-01/2025/0022.' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Crime Analytics Console"
        description="Real-time crime statistics, geospatial clusters, and predictive models for the Karnataka State Police."
        actions={
          <Button variant="primary" onClick={handleSyncData}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
            </svg>
            Sync Live Database
          </Button>
        }
      />

      {/* Summary StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Registered FIRs"
          value="300"
          change="+12.4%"
          trend="up"
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Active Investigations"
          value="142"
          change="+3.2%"
          trend="up"
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Repeat Offenders Tracked"
          value="79"
          change="-1.8%"
          trend="down"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Hotspot Locations"
          value="13"
          change="+8.3%"
          trend="up"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crime Categories Breakdown */}
        <DashboardCard title="Crime Categories Distribution" className="lg:col-span-2">
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Breakdown of registered offenses by core category across Bengaluru, Mysuru, Mandya, and Tumakuru.
            </p>
            <div className="space-y-4 pt-2">
              {categories.map((c) => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{c.name}</span>
                    <span className="font-bold">{c.count} Cases ({c.weight})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${c.color}`} 
                      style={{ width: c.weight }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Critical Alerts Feed */}
        <DashboardCard title="Recent Critical Alerts">
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {recentAlerts.map((a) => (
              <div 
                key={a.id} 
                className="p-4 rounded border bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{a.title}</span>
                  <span className="text-[9px] text-slate-400">{a.time}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{a.desc}</p>
                <div className="pt-1 flex items-center justify-between">
                  <Badge variant={a.type === 'critical' ? 'danger' : a.type === 'high' ? 'warning' : 'info'}>
                    {a.type}
                  </Badge>
                  <button className="text-blue-500 hover:text-blue-400 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold uppercase tracking-wider text-[9px]">
                    Inspect Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Recent Audit Activities (Full width below) */}
        <DashboardCard title="Recent System Audited Logs" className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-400">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Officer context</th>
                  <th className="py-3 px-4">Activity Description</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-600 dark:text-slate-300">
                {activities.map((act, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-mono">{act.time}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">{act.user}</td>
                    <td className="py-3.5 px-4 leading-relaxed">{act.act}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="success">Audited</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
