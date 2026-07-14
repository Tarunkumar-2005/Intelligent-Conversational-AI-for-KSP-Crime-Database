import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  BrainCircuit, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Activity, 
  RefreshCw, 
  ChevronRight, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { PageContainer, PageHeader, DashboardCard, StatCard } from '../components/LayoutComponents.jsx';
import { Button, Badge } from '../components/UIPrimitives.jsx';
import api from '../services/api.js';
import { useUI } from '../context/UIContext.jsx';

const PredictionPage = () => {
  const { addToast } = useUI();

  // Filters State
  const [filters, setFilters] = useState({
    district: '',
    crimeCategory: ''
  });

  // Predictions states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState({ historical: [], forecast: [] });
  const [hotspots, setHotspots] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (filters.district) params.district = filters.district;
      if (filters.crimeCategory) params.crimeCategory = filters.crimeCategory;

      const [overviewRes, trendsRes, hotspotsRes, alertsRes] = await Promise.all([
        api.get('/prediction/overview', { params }),
        api.get('/prediction/trends', { params }),
        api.get('/prediction/hotspots', { params }),
        api.get('/prediction/alerts', { params })
      ]);

      setOverview(overviewRes.data.data);
      setTrends(trendsRes.data.data);
      setHotspots(hotspotsRes.data.data);
      setAlerts(alertsRes.data.data);

    } catch (err) {
      console.error('Forecasting loading failed:', err);
      setError(true);
      addToast('Failed to load predictive warning calculations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRecalculate = () => {
    fetchPredictions();
    addToast('Recalculated moving averages and growth factors.', 'success');
  };

  const getMonthLabel = (num) => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[num - 1] || 'N/A';
  };

  // Build combined charts data mapping historical and forecast counts chronologically
  const chartData = [
    ...trends.historical.map(h => ({
      name: `${getMonthLabel(h.month)} ${h.year}`,
      'Historical Count': h.count,
      'Forecast Count': null
    })),
    ...trends.forecast.map(f => ({
      name: `${getMonthLabel(f.month)} ${f.year}`,
      'Historical Count': null,
      'Forecast Count': f.count
    }))
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Crime Forecasting & Early Warning"
        description="Predictive moving average curves, hotspots threat forecasting, and proactive early warning triggers."
        actions={
          <Button variant="primary" onClick={handleRecalculate} className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Recalculate Predictors
          </Button>
        }
      />

      {/* Filter toolbar card */}
      <div className="bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">Focus District</label>
          <select
            name="district"
            value={filters.district}
            onChange={handleFilterChange}
            className="w-full h-9 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="">All Districts</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Mandya">Mandya</option>
            <option value="Tumakuru">Tumakuru</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">Crime Category</label>
          <select
            name="crimeCategory"
            value={filters.crimeCategory}
            onChange={handleFilterChange}
            className="w-full h-9 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Robbery">Robbery</option>
            <option value="Theft">Theft</option>
            <option value="Cyber Crime">Cyber Crime</option>
            <option value="Fraud">Fraud</option>
            <option value="Assault">Assault</option>
          </select>
        </div>
      </div>

      {/* Predictions KPI overview */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200/50 dark:bg-slate-800/40 animate-pulse rounded border border-slate-150 dark:border-slate-800/50" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded p-5 flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold uppercase tracking-wider">Access Restrict Intercept</h4>
            <p className="mt-0.5 opacity-90">Geospatial forecasting modules require authorized Analyst or Supervisor privilege credentials.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Forecast Confidence" value={overview?.forecastConfidence} icon={<BrainCircuit className="w-5 h-5" />} color="blue" />
          <StatCard title="High Risk Window" value={overview?.highThreatWindow} icon={<Activity className="w-5 h-5" />} color="yellow" />
          <StatCard title="Target Sector Risk Hub" value={overview?.priorityClusterZone} icon={<MapPin className="w-5 h-5" />} color="red" />
          <StatCard title="Growth Trend Forecast" value={overview?.crimeGrowthForecast} icon={<ShieldAlert className="w-5 h-5" />} color="cyan" />
        </div>
      )}

      {/* Main Charts & warnings display */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Forecast Chart */}
          <DashboardCard title="6-Month Temporal Count Forecast Curve" className="lg:col-span-2">
            <div className="w-full h-80">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No forecast timelines available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', borderColor: '#1e293b' }} labelClassName="text-white text-xs font-bold" />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="Historical Count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Forecast Count" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>

          {/* Expected Hotspots */}
          <DashboardCard title="Projected Risk Hotspots">
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1 scrollbar">
              {hotspots.length === 0 ? (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded text-slate-400">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-green-500" />
                  <span>No high risk geospatial hotspots expected.</span>
                </div>
              ) : (
                hotspots.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 border border-slate-150 dark:border-slate-800/60 rounded bg-slate-50/50 dark:bg-slate-900/35"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{h.locationName}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{h.district} district • {h.casesCount} past cases</p>
                    </div>
                    <Badge variant={h.predictedRisk === 'Critical' ? 'danger' : h.predictedRisk === 'High' ? 'warning' : 'success'}>
                      {h.predictedRisk}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </DashboardCard>

          {/* Threat Warning Board */}
          <DashboardCard title="Early Warning Alerts Board" className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border border-slate-150 dark:border-slate-800/60 rounded bg-slate-50/40 dark:bg-slate-900/30 flex flex-col justify-between gap-3 hover:border-red-500/10 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{a.type}</span>
                      <Badge variant={a.severity === 'Critical' ? 'danger' : a.severity === 'High' ? 'warning' : 'success'}>
                        {a.severity}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 leading-snug">{a.description}</p>
                    <p className="text-[10px] text-slate-400">Affected zone: <span className="font-semibold text-slate-350">{a.affectedDistrict}</span></p>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800/50 pt-2.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-cyan-500 dark:text-cyan-400">Suggested Patrol Action:</p>
                    <p className="mt-0.5 leading-relaxed">{a.suggestedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

        </div>
      )}
    </PageContainer>
  );
};

export default PredictionPage;
