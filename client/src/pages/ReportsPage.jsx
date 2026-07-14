import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  ShieldAlert, 
  History, 
  RefreshCw, 
  User 
} from 'lucide-react';
import { PageContainer, PageHeader, DashboardCard } from '../components/LayoutComponents.jsx';
import { 
  Button, 
  Input, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHeaderCell, 
  Badge 
} from '../components/UIPrimitives.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { downloadInvestigationPDF, downloadAnalyticsPDF } from '../utils/pdfGenerator.js';
import api from '../services/api.js';

const ReportsPage = () => {
  const { addToast } = useUI();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const reports = [
    { id: 'REP-2026-001', name: 'Mysuru City Burglary Audit Report - Q1 2026', type: 'Geospatial Audit', author: 'Inspector Shekhar', date: '2026-07-01', size: '2.4 MB', format: 'PDF', trigger: () => downloadAnalyticsPDF('Mysuru') },
    { id: 'REP-2026-002', name: 'KGS Gang Association Network Analysis', type: 'Network Dossier', author: 'Analyst Raman', date: '2026-06-28', size: '4.8 MB', format: 'PDF', trigger: () => downloadInvestigationPDF('FIR-KSP-MYS-01-2024') },
    { id: 'REP-2026-003', name: 'Cyber Task Fraud Account Node Register', type: 'Asset Directory', author: 'Supervisor Gowda', date: '2026-06-15', size: '1.2 MB', format: 'PDF', trigger: () => downloadAnalyticsPDF('Bengaluru') },
    { id: 'REP-2026-004', name: 'District Resource Patrol Optimization Plan', type: 'Decision Matrix', author: 'System Optimizer', date: '2026-06-10', size: '920 KB', format: 'PDF', trigger: () => downloadInvestigationPDF('FIR-KSP-MNY-CEN-01-2025') }
  ];

  const fetchAuditLogs = async () => {
    if (user?.role !== 'Supervisor') return;
    setLogsLoading(true);
    try {
      const res = await api.get('/reports/log');
      setAuditLogs(res.data.data);
    } catch (err) {
      console.error('Failed to load report export audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user]);

  const handleExport = async (report) => {
    try {
      addToast(`Generating report PDF asynchronously...`, 'info');
      await report.trigger();
      addToast(`Report PDF downloaded successfully.`, 'success');
      // Reload logs for Supervisor
      fetchAuditLogs();
    } catch (err) {
      console.error(err);
      addToast('Error generating document.', 'error');
    }
  };

  const filtered = reports.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title={t('reports') === 'Reports Explorer' ? 'Reports Explorer' : t('reports') === 'ವರದಿ ದಾಖಲೆಗಳು' ? 'ವರದಿ ರಫ್ತು ಕೇಂದ್ರ' : 'Reports & Exports Explorer'}
        description="Compile, audit, and extract case files, analytics breakdowns, and chat history transcripts into PDF documents."
      />

      <div className="bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded p-4 mb-6 shadow-sm flex items-center">
        <div className="flex-1 relative">
          <Input 
            placeholder={t('search')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area: Reports Catalog list */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Document Catalog">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Report Title</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Generation Date</TableHeaderCell>
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-[10px] text-slate-400">{r.id}</TableCell>
                    <TableCell className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>{r.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{r.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleExport(r)} className="flex items-center gap-1.5 ml-auto">
                        <Download className="w-3 h-3" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>
        </div>

        {/* Right Area: Security Audit logs (Supervisor only) */}
        <div className="lg:col-span-1">
          {user?.role === 'Supervisor' ? (
            <DashboardCard 
              title="Security Export Audit Ledger"
              actions={
                <button onClick={fetchAuditLogs} className="text-slate-400 hover:text-cyan-400">
                  <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                </button>
              }
            >
              <p className="text-[10px] text-slate-500 mb-3.5 leading-relaxed">
                Official regulatory logs recording compiled investigation dossiers generated by portal agents.
              </p>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 italic">No report download audits recorded.</div>
                ) : (
                  auditLogs.map((log) => (
                    <div 
                      key={log._id} 
                      className="p-3 border border-slate-150 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/35 space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <User className="w-3 h-3 text-cyan-400" />
                          {log.user?.name || 'Officer'}
                        </span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1 leading-snug">{log.details}</p>
                      <p className="text-[9px] text-slate-400">IP Address: {log.ipAddress}</p>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          ) : (
            <DashboardCard title="Access Restriction">
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <ShieldAlert className="w-12 h-12 text-slate-400" />
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Ledger Hidden</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                    Export audit logs are restricted exclusively to Supervisor level credentials.
                  </p>
                </div>
              </div>
            </DashboardCard>
          )}
        </div>

      </div>
    </PageContainer>
  );
};

export default ReportsPage;
