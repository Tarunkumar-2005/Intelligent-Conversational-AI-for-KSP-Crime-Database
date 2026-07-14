import { jsPDF } from 'jspdf';
import api from '../services/api.js';

/**
 * Generates an Investigation Case Dossier PDF report
 */
export const downloadInvestigationPDF = async (firNumber = 'FIR-KSP-MYS-01-2024') => {
  const doc = new jsPDF();
  
  // Header Logo Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102); // KSP Navy Theme
  doc.text('KARNATAKA STATE POLICE', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Crime Investigation Department (CID) Case Dossier', 14, 28);
  doc.line(14, 32, 196, 32);

  // Metadata Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Reference Case File: ${firNumber}`, 14, 42);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Classification: Restricted / Official Use Only', 14, 48);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 54);
  doc.text('Platform: KSP Intelligent Conversational AI', 14, 60);

  // 1. Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Case Overview Summary', 14, 72);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summary = 'This intelligence report aggregates historical crime records, co-suspect relations networks, and vehicle registry assets linked to the suspect nodes. Relational mappings confirm multiple overlapping incidents under investigation.';
  doc.text(doc.splitTextToSize(summary, 180), 14, 78);

  // 2. Primary Targets Profile
  doc.setFont('helvetica', 'bold');
  doc.text('2. Primary Suspect Nodes', 14, 94);
  doc.setFont('helvetica', 'normal');
  doc.text('- Jitender Chaturvedi (Alias: Kolar Gold Smuggler) - Central suspect node.', 14, 100);
  doc.text('- Chaten Johar - Phone & Bank Accounts Linkage.', 14, 106);
  doc.text('- Bhudev Iyengar - Scorpio Transit Operator.', 14, 112);

  // 3. Recommended Actions
  doc.setFont('helvetica', 'bold');
  doc.text('3. Strategic Patrol Recommendations', 14, 126);
  doc.setFont('helvetica', 'normal');
  const recs = '1. Set mobile intercept coordinates checks near Vidyaranyapuram. \n2. Inquire financial tracking logs with cyber division under BNS sections.\n3. Keep vehicle checkpoints active during peak temporal window (13:00 - 15:30).';
  doc.text(recs, 14, 132);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('CONFIDENTIAL DOCUMENT - ILLEGAL COPYING SUBJECT TO PROSECUTION', 14, 280);

  doc.save(`${firNumber}_case_dossier.pdf`);

  // Log report export to backend
  try {
    await api.post('/reports/log', {
      reportType: 'Investigation Case Dossier',
      targetId: firNumber
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};

/**
 * Generates an Analytics & Predictions Summary PDF report
 */
export const downloadAnalyticsPDF = async (district = 'All Districts') => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text('KARNATAKA STATE POLICE', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Geospatial Analytics & Crime Predictions Summary', 14, 28);
  doc.line(14, 32, 196, 32);

  // Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Scope Area: ${district}`, 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Report Period: Q1-Q2 2026`, 14, 48);
  doc.text(`Compiled: ${new Date().toLocaleDateString()}`, 14, 54);

  // Section 1: Hotspots
  doc.setFont('helvetica', 'bold');
  doc.text('1. Top Expected Hotspot Sectors', 14, 68);
  doc.setFont('helvetica', 'normal');
  doc.text('- Vidyaranyapuram (Mysuru Division) - Critical Density', 14, 74);
  doc.text('- Indiranagar Market Area (Bengaluru East) - High Density', 14, 80);
  doc.text('- Mandya Commercial Zone (Mandya Central) - Moderate Threat', 14, 86);

  // Section 2: Temporal predictions
  doc.setFont('helvetica', 'bold');
  doc.text('2. Temporal Trend Forecasting', 14, 98);
  doc.setFont('helvetica', 'normal');
  const temporal = 'Aggregated moving averages indicate a projected increase in theft and burglary crimes during seasonal festival months. Overall cyber fraud incidents remain elevated.';
  doc.text(doc.splitTextToSize(temporal, 180), 14, 104);

  // Section 3: Risk KPIs
  doc.setFont('helvetica', 'bold');
  doc.text('3. Risk Parameters Weighting', 14, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('- Historical Coordinates Density: 45%', 14, 126);
  doc.text('- Offender Parole Calendars: 25%', 14, 132);
  doc.text('- Weather & Temporal Seasonality: 20%', 14, 138);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('CONFIDENTIAL ANALYTICS REPORT - FOR INTERNAL DISPOSITION ONLY', 14, 280);

  doc.save(`Crime_Analytics_Forecast_${district.replace(/\s+/g, '_')}.pdf`);

  try {
    await api.post('/reports/log', {
      reportType: 'Analytics & Predictions Summary',
      targetId: district
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};

/**
 * Exports Chat conversation threads to PDF
 */
export const downloadChatPDF = async (conversationTitle = 'Chat Session Export', messages = []) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text('KARNATAKA STATE POLICE', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Intelligent Chatbot Conversation Transcript', 14, 28);
  doc.line(14, 32, 196, 32);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(conversationTitle, 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Export Timestamp: ${new Date().toLocaleString()}`, 14, 48);

  let y = 60;
  
  if (messages.length === 0) {
    doc.text('No message history recorded in this session.', 14, y);
  } else {
    messages.forEach((msg, idx) => {
      // Manage page overflow
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const roleLabel = msg.sender === 'user' ? 'USER' : 'KSP AI ASSISTANT';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(msg.sender === 'user' ? 70 : 0, msg.sender === 'user' ? 70 : 102, msg.sender === 'user' ? 200 : 204);
      doc.text(`${roleLabel}:`, 14, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      
      const contentLines = doc.splitTextToSize(msg.content, 180);
      doc.text(contentLines, 14, y + 5);
      
      y += (contentLines.length * 4.5) + 12;
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('Intelligent Conversational AI Platform - Export Transcript', 14, 285);

  doc.save('Chat_Conversation_Export.pdf');

  try {
    await api.post('/reports/log', {
      reportType: 'Chat Conversation Export',
      targetId: conversationTitle
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};
