import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, DashboardCard, StatCard } from '../components/LayoutComponents.jsx';
import { Button, Badge } from '../components/UIPrimitives.jsx';
import { useUI } from '../context/UIContext.jsx';
import api from '../services/api.js';

const DecisionSupportPage = () => {
  const { addNotification } = useUI();

  // Selection states
  const [offenders, setOffenders] = useState([]);
  const [selectedOffender, setSelectedOffender] = useState(null);
  const [offenderProfile, setOffenderProfile] = useState(null);
  const [selectedFirId, setSelectedFirId] = useState('');
  
  // Decision support states
  const [summaryData, setSummaryData] = useState(null);
  const [recsData, setRecsData] = useState(null);
  const [similarData, setSimilarData] = useState([]);
  
  // Loaders
  const [loadingOffenders, setLoadingOffenders] = useState(true);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDecision, setLoadingDecision] = useState(false);

  useEffect(() => {
    fetchOffenders();
  }, []);

  // Fetch list of repeat offenders
  const fetchOffenders = async () => {
    setLoadingOffenders(true);
    try {
      const res = await api.get('/profile/repeat-offenders');
      const data = res.data?.data || [];
      setOffenders(data);
      if (data.length > 0) {
        handleSelectOffender(data[0]);
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to retrieve repeat offenders roster.');
    } finally {
      setLoadingOffenders(false);
    }
  };

  // Select offender and fetch their cases
  const handleSelectOffender = async (offender) => {
    setSelectedOffender(offender);
    setLoadingCases(true);
    try {
      const res = await api.get(`/profile/offender/${offender.id}`);
      const profile = res.data?.data || null;
      setOffenderProfile(profile);
      
      // Auto select first case if exists
      if (profile && profile.timeline && profile.timeline.length > 0) {
        handleSelectCase(profile.timeline[0].id);
      } else {
        setSelectedFirId('');
        setSummaryData(null);
        setRecsData(null);
        setSimilarData([]);
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to fetch offender profile cases.');
    } finally {
      setLoadingCases(false);
    }
  };

  // Select case and fetch decision support analytics
  const handleSelectCase = async (firId) => {
    setSelectedFirId(firId);
    setLoadingDecision(true);
    try {
      const summaryRes = await api.get(`/profile/investigation-summary/${firId}`);
      const recsRes = await api.get(`/profile/investigation-recommendations/${firId}`);
      const similarRes = await api.get(`/profile/similar-cases/${firId}`);
      
      setSummaryData(summaryRes.data?.data || null);
      setRecsData(recsRes.data?.data || null);
      setSimilarData(similarRes.data?.data || []);
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to load case decision support data.');
    } finally {
      setLoadingDecision(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Investigator Decision Support Panel"
        description="Dynamic recommendations, case timeline tracing, similar case discovery matching, and AI lead suggestions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Console: Offender & Case Selectors */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Offender Selector">
            {loadingOffenders ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Select Target Repeat Offender</label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {offenders.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => handleSelectOffender(o)}
                      className={`
                        p-2.5 rounded border text-left text-xs font-semibold transition-all duration-150 flex justify-between items-center
                        ${selectedOffender?.id === o.id 
                          ? 'border-blue-500 bg-blue-500/5 dark:border-cyan-400 dark:bg-cyan-500/5 text-blue-600 dark:text-cyan-400' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}
                      `}
                    >
                      <div>
                        <div className="font-bold">{o.name}</div>
                        <div className="text-[9px] opacity-60 uppercase">{o.gang || 'Independent'}</div>
                      </div>
                      <Badge variant={o.risk === 'Critical' ? 'danger' : 'info'}>{o.risk}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Linked Cases Selection */}
          <DashboardCard title="Target Case Dossier">
            {loadingCases ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : offenderProfile && offenderProfile.timeline && offenderProfile.timeline.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Select Criminal Case Link</label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {offenderProfile.timeline.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectCase(t.id)}
                      className={`
                        p-2.5 rounded border text-left text-xs font-semibold transition-all duration-150
                        ${selectedFirId === t.id 
                          ? 'border-blue-500 bg-blue-500/5 dark:border-cyan-400 dark:bg-cyan-500/5 text-blue-600 dark:text-cyan-400' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}
                      `}
                    >
                      <span className="font-bold text-[10px] block">{new Date(t.date).toLocaleDateString()}</span>
                      <span className="block mt-0.5">{t.event}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-2">
                No active case logs linked to the selected criminal.
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Console: Decision Support Analytics Output */}
        <div className="lg:col-span-2 space-y-6">
          {loadingDecision ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-cyan-400"></div>
            </div>
          ) : summaryData ? (
            <div className="space-y-6">
              {/* Case Stats Summary Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Priority Score" value={recsData?.priority || 'N/A'} variant={recsData?.priority === 'Critical' ? 'danger' : recsData?.priority === 'High' ? 'warning' : 'info'} />
                <StatCard title="Suspects Listed" value={`${summaryData.summary.suspectsCount} Suspects`} />
                <StatCard title="Evidence Attached" value={`${summaryData.summary.evidenceCount} Files`} />
                <StatCard title="Case Status" value={summaryData.summary.status} />
              </div>

              {/* Actionable Next Step Recommendations */}
              <DashboardCard title="AI Coordinated Recommendations">
                {recsData && recsData.recommendations && recsData.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recsData.recommendations.map((r, idx) => (
                      <div key={idx} className="p-3 border border-blue-500/20 dark:border-cyan-500/20 rounded bg-blue-500/5 dark:bg-cyan-500/5 text-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1 text-[13px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-cyan-400"></span>
                          {r.action}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{r.rationale}</p>
                      </div>
                    ))}
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                      Evidence Source: {recsData.evidenceBacking}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No custom suggestions available for this case.</div>
                )}
              </DashboardCard>

              {/* Case Chronological Timeline */}
              <DashboardCard title="Case Event Timeline">
                {summaryData.timeline && summaryData.timeline.length > 0 ? (
                  <div className="relative border-l border-slate-200 dark:border-slate-800 ml-2.5 pl-4 space-y-4">
                    {summaryData.timeline.map((t, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-cyan-400 border border-white dark:border-slate-900"></span>
                        <div className="text-xs font-semibold">
                          <span className="text-[10px] text-slate-400 font-bold block">{new Date(t.date).toLocaleDateString()}</span>
                          <span className="text-slate-800 dark:text-slate-100 font-bold block">{t.event}</span>
                          <span className="text-slate-500 dark:text-slate-400 leading-relaxed block mt-0.5">{t.details}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No events logged in the case register.</div>
                )}
              </DashboardCard>

              {/* Similar Case Matches Discovery */}
              <DashboardCard title="Similar Historical Cases Found">
                {similarData && similarData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similarData.map((m, idx) => (
                      <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800/60 rounded bg-slate-50 dark:bg-slate-900/10 text-xs font-semibold flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">FIR: {m.firNumber}</span>
                            <Badge variant={m.similarityScore >= 0.7 ? 'danger' : 'info'}>{Math.round(m.similarityScore * 100)}% Match</Badge>
                          </div>
                          <div className="text-[10px] text-slate-400 mb-2">Reported Date: {new Date(m.date).toLocaleDateString()}</div>
                          <div className="space-y-1 text-slate-600 dark:text-slate-400">
                            {m.matchingEvidence.map((e, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                                <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                                {e}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No similar cases detected with matching features.</div>
                )}
              </DashboardCard>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded text-slate-400 font-semibold text-xs">
              Select an offender and a target case link to load Decision Support options.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default DecisionSupportPage;
