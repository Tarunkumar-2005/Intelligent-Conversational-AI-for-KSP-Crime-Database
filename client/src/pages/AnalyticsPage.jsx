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
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  Users, 
  UserCheck, 
  Activity, 
  MapPin, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';
import { PageContainer, PageHeader, DashboardCard, StatCard } from '../components/LayoutComponents.jsx';
import { Button, Input } from '../components/UIPrimitives.jsx';
import api from '../services/api.js';
import { useUI } from '../context/UIContext.jsx';

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const AnalyticsPage = () => {
  const { addToast } = useUI();
  
  // Filter States
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    district: '',
    year: '',
    month: ''
  });

  // KPI Overview, Trend lists and charts data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [stations, setStations] = useState([]);
  const [investigationStatus, setInvestigationStatus] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // Load all analytics data matching current filter state
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      // Execute queries in parallel for peak performance
      const [
        overviewRes,
        trendsRes,
        typesRes,
        districtsRes,
        stationsRes,
        statusRes,
        monthlyRes
      ] = await Promise.all([
        api.get('/analytics/overview', { params }),
        api.get('/analytics/crime-trends', { params }),
        api.get('/analytics/crime-types', { params }),
        api.get('/analytics/districts', { params }),
        api.get('/analytics/police-stations', { params }),
        api.get('/analytics/investigation-status', { params }),
        api.get('/analytics/monthly', { params })
      ]);

      setOverview(overviewRes.data.data);
      setTrends(trendsRes.data.data);
      setCrimeTypes(typesRes.data.data);
      setDistricts(districtsRes.data.data);
      setStations(stationsRes.data.data);
      setInvestigationStatus(statusRes.data.data);
      setMonthlyData(monthlyRes.data.data);

    } catch (err) {
      console.error('Analytics Loading Failed:', err);
      setError(true);
      addToast('Failed to retrieve analytics data from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      district: '',
      year: '',
      month: ''
    });
    addToast('Filters reset successfully.', 'success');
  };

  // Convert month number to string labels
  const getMonthLabel = (num) => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[num - 1] || 'N/A';
  };

  // Format trends dataset for line chart
  const formattedTrends = trends.map(t => ({
    name: `${getMonthLabel(t.month)} ${t.year}`,
    Incidents: t.count
  }));

  // Format monthly dataset for area chart
  const formattedMonthly = monthlyData.map(m => ({
    name: getMonthLabel(m.month),
    Incidents: m.count
  }));

  // Format status dataset for donut labels
  const statusData = investigationStatus.map(s => ({
    name: s.status,
    value: s.count
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Crime Analytics Intelligence"
        description="MongoDB Aggregation powered trends, division summaries, and category ratios."
        actions={
          <Button variant="secondary" onClick={handleResetFilters} className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </Button>
        }
      />

      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">Start Date</label>
          <Input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange}
            className="w-full text-xs"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">End Date</label>
          <Input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange}
            className="w-full text-xs"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">District</label>
          <select
            name="district"
            value={filters.district}
            onChange={handleFilterChange}
            className="w-full h-9 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Districts</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Mandya">Mandya</option>
            <option value="Tumakuru">Tumakuru</option>
          </select>
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full h-9 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">Month</label>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="w-full h-9 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200/50 dark:bg-slate-800/40 animate-pulse rounded border border-slate-150 dark:border-slate-800/50" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded p-5 flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold uppercase tracking-wider">Failed to Ingest Analytics</h4>
            <p className="mt-0.5 opacity-90">Please check Mongoose connectivity status and reload database context pipelines.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total FIRs" value={overview?.totalFIRs || 0} icon={<FileText className="w-5 h-5" />} color="blue" />
          <StatCard title="Active Investigations" value={overview?.activeInvestigations || 0} icon={<Activity className="w-5 h-5" />} color="yellow" />
          <StatCard title="Closed Cases" value={overview?.closedCases || 0} icon={<UserCheck className="w-5 h-5" />} color="green" />
          <StatCard title="Registered Suspects" value={overview?.registeredCriminals || 0} icon={<Users className="w-5 h-5" />} color="cyan" />
          <StatCard title="Repeat Offenders" value={overview?.repeatOffenders || 0} icon={<ShieldAlert className="w-5 h-5" />} color="red" />
          <StatCard title="Victims & Complainants" value={overview?.victims || 0} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard title="Police Stations" value={overview?.policeStations || 0} icon={<MapPin className="w-5 h-5" />} color="green" />
          <StatCard title="Crime Categories" value={overview?.crimeCategories || 0} icon={<TrendingUp className="w-5 h-5" />} color="cyan" />
        </div>
      )}

      {/* Analytics Charts Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Line Chart: Crime Trend */}
          <DashboardCard title="Crime Incidents Trend Over Time">
            <div className="w-full h-80">
              {formattedTrends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No timeline trend data to display.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTrends} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', borderColor: '#1e293b' }} labelClassName="text-white text-xs font-bold" />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="Incidents" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>

          {/* Bar Chart: Districts */}
          <DashboardCard title="Crimes by District Division">
            <div className="w-full h-80">
              {districts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No district metrics to display.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districts} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="district" stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', borderColor: '#1e293b' }} labelClassName="text-white text-xs font-bold" />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="count" name="Incidents Count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>

          {/* Pie Chart: Crime Categories */}
          <DashboardCard title="Crime Categories Breakdown">
            <div className="w-full h-80 flex flex-col md:flex-row items-center justify-between gap-4">
              {crimeTypes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic w-full">No category metrics to display.</div>
              ) : (
                <>
                  <div className="w-full md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={crimeTypes}
                          dataKey="count"
                          nameKey="categoryName"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          labelLine={false}
                        >
                          {crimeTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2 overflow-y-auto max-h-[250px] p-2 pr-4 scrollbar">
                    {crimeTypes.map((c, index) => (
                      <div key={c.categoryName} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                          <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{c.categoryName}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DashboardCard>

          {/* Area Chart: Monthly Count */}
          <DashboardCard title="Monthly Incident Distribution Profile">
            <div className="w-full h-80">
              {formattedMonthly.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No monthly distribution data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedMonthly} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', borderColor: '#1e293b' }} labelClassName="text-white text-xs font-bold" />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="Incidents" stroke="#10b981" fillOpacity={1} fill="url(#colorIncidents)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>

          {/* Horizontal Bar Chart: Police Station Comparison */}
          <DashboardCard title="Top 10 Police Station Rankings">
            <div className="w-full h-80">
              {stations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No station rankings to display.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stations} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} fontStyle="bold" />
                    <YAxis dataKey="stationName" type="category" stroke="#64748b" fontSize={8} fontStyle="bold" width={110} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', borderColor: '#1e293b' }} labelClassName="text-white text-xs font-bold" />
                    <Bar dataKey="count" name="FIR Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>

          {/* Donut Chart: Investigation Status */}
          <DashboardCard title="Investigation Status Ratios">
            <div className="w-full h-80 flex flex-col md:flex-row items-center justify-between gap-4">
              {statusData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic w-full">No status metrics.</div>
              ) : (
                <>
                  <div className="w-full md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          labelLine={false}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2 overflow-y-auto max-h-[250px] p-2 pr-4 scrollbar">
                    {statusData.map((s, index) => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                          <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{s.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DashboardCard>

        </div>
      )}
    </PageContainer>
  );
};

export default AnalyticsPage;
