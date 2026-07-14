import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, DashboardCard } from '../components/LayoutComponents.jsx';
import { Button, Input, Badge } from '../components/UIPrimitives.jsx';
import { Modal } from '../components/Modals.jsx';
import { useUI } from '../context/UIContext.jsx';
import api from '../services/api.js';

const ProfilePage = () => {
  const { addNotification } = useUI();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  
  // Backend lists
  const [offenders, setOffenders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Inspected dossier details
  const [inspectId, setInspectId] = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [behaviorData, setBehaviorData] = useState(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  useEffect(() => {
    fetchRepeatOffenders();
  }, []);

  const fetchRepeatOffenders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/repeat-offenders');
      setOffenders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to retrieve repeat offenders roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (o) => {
    setInspectId(o.id);
    setLoadingInspect(true);
    try {
      addNotification('info', `Inspecting criminal file: ${o.name}`);
      const profileRes = await api.get(`/profile/offender/${o.id}`);
      const behaviorRes = await api.get(`/profile/behavior/${o.id}`);
      setInspectData(profileRes.data?.data || null);
      setBehaviorData(behaviorRes.data?.data || null);
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to retrieve criminal dossier logs.');
    } finally {
      setLoadingInspect(false);
    }
  };

  const filtered = offenders.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase()) || (o.gang && o.gang.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filterRole === 'All' || o.status === filterRole;
    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Offender Profiling Matrix"
        description="Detailed dossiers of repeat offenders, gang hierarchies, behavior indicators, and dynamic threat risk indexes."
      />

      {/* Filters Area */}
      <div className="bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input 
            placeholder="Search offender name or gang association..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['All', 'In Custody', 'Absconding', 'Under Trial', 'Active'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterRole(status)}
              className={`
                px-3.5 py-2 text-xs font-semibold rounded border transition-all duration-150 whitespace-nowrap
                ${filterRole === status 
                  ? 'bg-blue-500 border-blue-500 text-white dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-[#070e1b] dark:border-slate-800 dark:text-slate-400'}
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Offenders Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-cyan-400"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No repeat offenders matched current search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((o) => (
            <DashboardCard key={o.id} className="hover:border-blue-500/40 dark:hover:border-cyan-400/40 transition-colors duration-200">
              <div className="flex flex-col items-center text-center p-2">
                {/* Photo Silhouette Placeholder */}
                <div className="w-20 h-20 bg-slate-100 dark:bg-[#08101f] border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 shadow-inner">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{o.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">{o.gang || 'Independent'}</p>
                
                <div className="flex flex-col gap-1.5 w-full pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[10px] leading-relaxed">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Risk Level:</span>
                    <Badge variant={o.risk === 'Critical' ? 'danger' : o.risk === 'High' ? 'warning' : 'info'}>{o.risk} ({o.score})</Badge>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Cases Count:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{o.casesCount} FIRs</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Status:</span>
                    <Badge variant={o.status === 'In Custody' ? 'success' : o.status === 'Absconding' ? 'danger' : 'info'}>{o.status}</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-5 text-center" onClick={() => handleInspect(o)}>
                  Inspect File
                </Button>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* Dossier Detail Modal */}
      <Modal
        isOpen={inspectId !== null}
        onClose={() => { setInspectId(null); setInspectData(null); setBehaviorData(null); }}
        title="Offender Dossier File"
        actions={
          <Button variant="outline" onClick={() => { setInspectId(null); setInspectData(null); setBehaviorData(null); }}>
            Close Dossier
          </Button>
        }
      >
        {loadingInspect ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-cyan-400"></div>
          </div>
        ) : inspectData && (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 overflow-y-auto max-h-[70vh] pr-2">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-[#070e1b] rounded-full flex items-center justify-center text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{inspectData.criminal.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Aliases: {inspectData.criminal.aliases || 'None'} • Gang: {inspectData.criminal.gang || 'Independent'}
                </p>
              </div>
            </div>

            {/* Dynamic Threat Risk Matrix */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded border border-slate-200 dark:border-slate-800/60">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Dynamic Risk Index</h4>
                <Badge variant={inspectData.risk.level === 'Critical' ? 'danger' : inspectData.risk.level === 'High' ? 'warning' : 'info'}>
                  {inspectData.risk.level} ({inspectData.risk.score}/100)
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">Calculated dynamically at query execution based on crime parameters.</p>
              <div className="space-y-1.5">
                {inspectData.risk.factors.map((f, i) => (
                  <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5 font-semibold">
                    <span className="text-blue-500">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Behaviour Profile */}
            {behaviorData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded border border-slate-200 dark:border-slate-800/50">
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Crime Preferences</p>
                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <div>Category: <span className="font-bold text-blue-500 dark:text-cyan-400">{inspectData.preferences.preferredCategory}</span></div>
                    <div>District focus: <span className="font-bold text-slate-800 dark:text-slate-200">{inspectData.preferences.preferredDistrict}</span></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded border border-slate-200 dark:border-slate-800/50">
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Behaviour Classification</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{behaviorData.classification}</p>
                </div>
              </div>
            )}

            {/* Associates */}
            {inspectData.associates && inspectData.associates.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Mapped Network Associates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {inspectData.associates.map((a, i) => (
                    <div key={i} className="p-2 border border-slate-200 dark:border-slate-800/60 rounded bg-slate-50 dark:bg-slate-900/20 font-semibold flex justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{a.name}</span>
                        {a.aliases && <span className="text-[10px] text-slate-400 ml-1">({a.aliases})</span>}
                      </div>
                      <Badge variant="info">{a.sharedCasesCount} shared case{a.sharedCasesCount > 1 ? 's' : ''}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Criminal Cases Timeline */}
            {inspectData.timeline && inspectData.timeline.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Criminal Timeline Log</h4>
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-2.5 pl-4 space-y-4">
                  {inspectData.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline Bullet */}
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-cyan-400 border border-white dark:border-slate-900"></span>
                      <div className="text-xs font-semibold">
                        <span className="text-[10px] text-slate-400 block font-bold">{new Date(item.date).toLocaleDateString()}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold block">{item.event}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed block mt-0.5">{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ProfilePage;
