import React from 'react';
import { PageContainer, PageHeader, DashboardCard } from '../components/LayoutComponents.jsx';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell, Badge } from '../components/UIPrimitives.jsx';

const AdminPage = () => {
  const auditLogs = [
    { timestamp: '2026-07-05 08:32:11', user: 'Investigator Shekhar', badge: 'KSP-BLR-INV-102', action: 'LOGIN_SUCCESS', details: 'User Shekhar authenticated successfully.', ip: '127.0.0.1' },
    { timestamp: '2026-07-05 08:31:02', user: 'Unknown User', badge: 'N/A', action: 'LOGIN_FAILED', details: 'Failed authentication attempt for email: inv.fake@ksp.gov.in', ip: '192.168.1.14' },
    { timestamp: '2026-07-05 07:15:30', user: 'Analyst Raman', badge: 'KSP-MYS-ANA-204', action: 'LOGIN_SUCCESS', details: 'User Raman authenticated successfully.', ip: '127.0.0.1' },
    { timestamp: '2026-07-04 18:44:02', user: 'Supervisor Gowda', badge: 'KSP-MYS-SUP-301', action: 'LOGOUT', details: 'User Gowda logged out and terminated session.', ip: '127.0.0.1' },
    { timestamp: '2026-07-04 15:10:45', user: 'Investigator Shekhar', badge: 'KSP-BLR-INV-102', action: 'LOGIN_FAILED', details: 'Login block: Deactivated account access attempt by devesh.dutta@ksp.gov.in', ip: '127.0.0.1' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Administrative Controls Portal"
        description="Supervisor privilege module: Security audit logs, portal access tracking, and security status registers."
      />

      <div className="grid grid-cols-1 gap-6">
        <DashboardCard title="Real-Time Security Audit Logs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>Officer context</TableHeaderCell>
                <TableHeaderCell>Badge ID</TableHeaderCell>
                <TableHeaderCell>Action Type</TableHeaderCell>
                <TableHeaderCell>Audit Description Details</TableHeaderCell>
                <TableHeaderCell>Terminal IP</TableHeaderCell>
                <TableHeaderCell className="text-right">Audit Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-slate-500">{log.timestamp}</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-200">{log.user}</TableCell>
                  <TableCell className="font-semibold text-slate-500">{log.badge}</TableCell>
                  <TableCell>
                    <Badge variant={log.action.includes('SUCCESS') ? 'success' : log.action.includes('FAILED') ? 'danger' : 'info'}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="leading-relaxed">{log.details}</TableCell>
                  <TableCell className="font-mono text-slate-400">{log.ip}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success">Verified</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardCard>
      </div>
    </PageContainer>
  );
};

export default AdminPage;
