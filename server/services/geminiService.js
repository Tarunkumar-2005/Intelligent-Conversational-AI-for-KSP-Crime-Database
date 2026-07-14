import { GoogleGenAI } from '@google/genai';
import logger from '../config/logger.js';

// Initialize the Google GenAI SDK using process env credentials
const getGenAIInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error('GEMINI_API_KEY environment variable is missing.');
    throw new Error('Gemini configuration error');
  }
  return new GoogleGenAI({ apiKey });
};

// Modular Prompt Templates for the KSP AI Assistant
export const prompts = {
  systemInstruction: `You are an expert Law Enforcement Intelligence Analyst for the Karnataka State Police (KSP).
Your role is to assist officers by analyzing crime data, explaining suspect networks, summarizing FIR registers, and outlining optimal resource allocations.
You must adhere strictly to these security and privacy rules:
1. NEVER expose raw MongoDB ObjectIds (like "_id": "6a4a0...") in your final natural language response. Replace them with human-readable identifiers or names (e.g. "Shekhar" or "Dossier 0045").
2. NEVER mention or expose secrets, internal API paths, or JWT signature configs.
3. Be professional, objective, and clear. Format findings using clean markdown lists, tables, and bold headers.
4. Translate raw codes or database structures into standard terminology suitable for senior police supervisors.
5. IF the backend structured JSON data contains zero records (count is 0 or results is empty), you MUST politely respond: "No matching records were found." Do NOT hallucinate or manufacture fake cases, suspect details, phone logs, or statistics.`,

  chatPrompt: (query, data) => 
    `User Query: "${query}"\n\nStructured Backend Data Context:\n${JSON.stringify(data, null, 2)}\n\nPerform reasoning on the provided data context and draft a detailed, helpful natural language response.`,

  summaryPrompt: (query, data) => 
    `User Request: Summarize recent crime files.\n\nDatabase Records Context:\n${JSON.stringify(data, null, 2)}\n\nCompile a comprehensive summary report outlining total cases, active vs. closed indicators, and a list of key offenses.`,

  analyticsPrompt: (query, data) => 
    `User Request: Analyze district crime trends.\n\nDatabase Analytics Context:\n${JSON.stringify(data, null, 2)}\n\nPerform analysis on this division distribution data. Explain crime percentages, locate density spikes, and outline anomalies.`,

  networkPrompt: (query, data) => 
    `User Request: Explain criminal connections.\n\nCriminal Network Linkages Context:\n${JSON.stringify(data, null, 2)}\n\nExplain the relationships between suspect names, shared burner phones, bank transfer accounts, and vehicles. Detail the strength of the association.`,

  profilingPrompt: (query, data) => 
    `User Request: Profile repeat suspects.\n\nSuspect Dossiers Context:\n${JSON.stringify(data, null, 2)}\n\nGenerate detailed profiles for the requested suspects. List their Modus Operandi (MO), threat risk indicators, and warrant statuses.`,

  offenderProfilingPrompt: (query, data) =>
    `User Request: Profile offender.\n\nCriminal Profile Context Data:\n${JSON.stringify(data, null, 2)}\n\nAnalyze this criminal profile data. Detail their dynamic risk score, factors contributing to risk level, preferred crime patterns, and known associates. Make sure to present your findings as a structured markdown report.`,

  decisionSupportPrompt: (query, data) =>
    `User Request: Decision support.\n\nCase Investigation Context:\n${JSON.stringify(data, null, 2)}\n\nAnalyze this case details context. Compile an investigation summary, suggest actionable investigation leads, list missing evidence, and outline recommended next steps.`,

  similarCasesPrompt: (query, data) =>
    `User Request: Similar cases.\n\nSimilar Cases Context:\n${JSON.stringify(data, null, 2)}\n\nAnalyze the matches list. Explain why these historical cases are similar to the reference case based on shared attributes (modi operandi, locations, categories).`,

  reportPrompt: (query, data) => 
    `User Request: Generate investigation report.\n\nCase File Context:\n${JSON.stringify(data, null, 2)}\n\nGenerate a professional, structured police investigation report sheet matching government standards. Outline findings, suspects, evidence, and next steps.`
};

class GeminiService {
  /**
   * Translates conversation history format to standard Gemini API parts format
   */
  _formatHistory(history) {
    if (!history || history.length === 0) return [];
    
    return history.map(msg => {
      const role = msg.sender === 'user' ? 'user' : 'model';
      return {
        role,
        parts: [{ text: msg.content }]
      };
    });
  }

  /**
   * Selects prompt template based on query intent classification
   */
  _getPrompt(intent, query, data) {
    switch (intent) {
      case 'Case Summary':
        return prompts.summaryPrompt(query, data);
      case 'Analytics':
        return prompts.analyticsPrompt(query, data);
      case 'Network Analysis':
        return prompts.networkPrompt(query, data);
      case 'Criminal Search':
        return prompts.profilingPrompt(query, data);
      case 'Offender Profiling':
        return prompts.offenderProfilingPrompt(query, data);
      case 'Investigator Decision Support':
        return prompts.decisionSupportPrompt(query, data);
      case 'Similar Cases':
        return prompts.similarCasesPrompt(query, data);
      case 'Crime Search':
        return prompts.chatPrompt(query, data);
      default:
        return prompts.chatPrompt(query, data);
    }
  }

  /**
   * High-fidelity local rules-based backup responder when Gemini is exhausted or offline
   */
  _getFallbackResponse(intent, query, data) {
    logger.warn(`GeminiService: Generating local rule-based fallback response (Intent: ${intent})`);
    
    if (!data || data.count === 0 || (data.results && data.results.length === 0)) {
      return {
        answer: "No matching records were found.",
        summary: "Zero matching records were retrieved from the MongoDB database.",
        supportingEvidence: "Count parameter is 0.",
        confidence: "High (Database Verified)",
        suggestedFollowUpQuestions: [
          "Try searching for all active cases instead?",
          "Can you search for a different district or category?"
        ]
      };
    }

    let answer = `### Karnataka State Police - Database Analysis Report\n\n`;
    let summary = `Retrieved ${data.count} records matching the search filters.`;
    let evidence = `Identified relevant matches in database search.`;

    if (intent === 'Crime Search') {
      answer += `Successfully retrieved **${data.count} case logs** matching search criteria:\n\n`;
      data.results.forEach((fir, idx) => {
        answer += `${idx + 1}. **FIR Number**: \`${fir.firNumber}\`  \n`;
        answer += `   - **Category**: ${fir.crimeCategory?.name || 'N/A'}  \n`;
        answer += `   - **Police Station**: ${fir.policeStation?.name || 'N/A'}  \n`;
        answer += `   - **Status**: \`${fir.status}\`  \n`;
        answer += `   - **Brief Facts**: *${fir.briefFacts}*  \n\n`;
      });
      summary = `Found ${data.count} cases, including robbery, burglary, or cyber incident categories.`;
      evidence = `Matched keys: [${data.results.map(f => f.firNumber).join(', ')}]`;

    } else if (intent === 'Criminal Search') {
      answer += `Successfully compiled **${data.count} criminal dossier sheets**:\n\n`;
      data.results.forEach((sus, idx) => {
        answer += `${idx + 1}. **Suspect**: \`${sus.firstName} ${sus.lastName || ''}\` (${sus.gender}, Age ${sus.age || 'N/A'})  \n`;
        answer += `   - **Status**: \`${sus.status}\`  \n`;
        answer += `   - **Modus Operandi**: ${sus.modusOperandi?.join(', ') || 'N/A'}  \n`;
        answer += `   - **Linked Cases**: ${sus.firs?.length || 0} active files  \n\n`;
      });
      summary = `Retrieved ${data.count} suspect profiles matching investigation criteria.`;
      evidence = `Suspect names: [${data.results.map(s => `${s.firstName} ${s.lastName || ''}`).join(', ')}]`;

    } else if (intent === 'Victim Search') {
      answer += `Located complainant profile details in database records:\n\n`;
      data.results.forEach((vic, idx) => {
        answer += `- **Victim**: \`${vic.firstName} ${vic.lastName || ''}\`  \n`;
        answer += `  - **Contact**: ${vic.contactNumber}  \n`;
        answer += `  - **Address**: ${vic.address}  \n\n`;
      });
      summary = `Retrieved victim/complainant context profile.`;

    } else if (intent === 'Analytics') {
      answer += `### Crime Analytics Report\n\n`;
      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        if (first && first.totalFIRs !== undefined) {
          answer += `#### Key Performance Indicators:\n`;
          answer += `- **Total FIRs**: ${first.totalFIRs}\n`;
          answer += `- **Active Investigations**: ${first.activeInvestigations}\n`;
          answer += `- **Closed Cases**: ${first.closedCases}\n`;
          answer += `- **Registered Criminals**: ${first.registeredCriminals}\n`;
          answer += `- **Repeat Offenders**: ${first.repeatOffenders}\n`;
          answer += `- **Victims**: ${first.victims}\n`;
          answer += `- **Police Stations**: ${first.policeStations}\n`;
          answer += `- **Crime Categories**: ${first.crimeCategories}\n`;
          summary = `Compiled core KPI dashboard metrics showing ${first.totalFIRs} total FIRs.`;
        } else {
          answer += `| Metric / Parameter | Count |\n| --- | --- |\n`;
          data.results.forEach(row => {
            const label = row.district || row.categoryName || row.stationName || row.locationName || row.status || (row.year && row.month ? `Year ${row.year} Month ${row.month}` : `Month ${row.month}` || `Year ${row.year}` || 'N/A');
            answer += `| ${label} | ${row.count} |\n`;
          });
          summary = `Retrieved crime analytics listing showing ${data.results.length} rows.`;
        }
      }
      evidence = `Analytics aggregation successfully run against MongoDB.`;

    } else if (intent === 'Case Summary') {
      const stats = data.results[0]?.globalCounts || {};
      const statusBreakdown = data.results[0]?.statusBreakdown || [];
      
      answer += `### Executive Crime Statistics Summary\n\n`;
      answer += `| Metric | Count |\n| --- | --- |\n`;
      answer += `| **Total FIRs** | ${stats.totalFIRs || 0} |\n`;
      answer += `| **Total Criminals** | ${stats.totalCriminals || 0} |\n`;
      answer += `| **Total Victims** | ${stats.totalVictims || 0} |\n`;
      answer += `| **Evidence Files** | ${stats.totalEvidence || 0} |\n\n`;
      
      answer += `**Case Status Breakdown**:\n`;
      statusBreakdown.forEach(item => {
        answer += `- \`${item.status}\`: ${item.count} cases  \n`;
      });
      
      summary = `Compiled global audit of ${stats.totalFIRs} cases and ${stats.totalCriminals} suspect profiles.`;
      evidence = `Counts: FIRs=${stats.totalFIRs}, Suspects=${stats.totalCriminals}, Victims=${stats.totalVictims}.`;
    } else if (intent === 'Network Analysis') {
      const graph = data.results[0] || { nodes: [], edges: [] };
      answer += `### Criminal Relationship Network Dossier\n\n`;
      answer += `Successfully retrieved **${graph.nodes.length} entities** and **${graph.edges.length} linkages**:\n\n`;
      
      answer += `#### Relational Entity Nodes:\n`;
      graph.nodes.forEach((n, idx) => {
        answer += `- **${n.label}** (\`${n.type}\` ID: \`${n.id}\`)  \n`;
      });

      answer += `\n#### Association Edges:\n`;
      graph.edges.forEach(e => {
        answer += `- \`${e.source}\` ➔ **${e.relationshipType}** ➔ \`${e.target}\`  \n`;
      });

      if (data.insights) {
        answer += `\n#### Automatically Flagged Network Insights:\n`;
        if (data.insights.repeatOffenders && data.insights.repeatOffenders.length > 0) {
          answer += `- **Repeat Offenders**: ${data.insights.repeatOffenders.join(', ')}  \n`;
        }
        if (data.insights.highlyConnectedSuspects && data.insights.highlyConnectedSuspects.length > 0) {
          const names = data.insights.highlyConnectedSuspects.map(h => `${h.name} (${h.linksCount} links)`).join(', ');
          answer += `- **Highly Connected Suspects**: ${names}  \n`;
        }
        if (data.insights.sharedPhones && data.insights.sharedPhones.length > 0) {
          data.insights.sharedPhones.forEach(sp => {
            answer += `- **Shared Phone Number**: \`${sp.phone}\` is used by: *${sp.suspects.join(', ')}*  \n`;
          });
        }
        if (data.insights.sharedBanks && data.insights.sharedBanks.length > 0) {
          data.insights.sharedBanks.forEach(sb => {
            answer += `- **Shared Bank Account**: \`${sb.account}\` is owned by: *${sb.suspects.join(', ')}*  \n`;
          });
        }
      }

      summary = `Compiled criminal network containing ${graph.nodes.length} nodes and ${graph.edges.length} edges.`;
      evidence = `Matched nodes: [${graph.nodes.map(n => n.label).join(', ')}]`;
    } else if (intent === 'Crime Hotspots') {
      answer += `### Crime Hotspot & Geospatial Report\n\n`;
      answer += `Identified **${data.count} active hotspots** matching location query parameters:\n\n`;
      answer += `| Location Name | District | Division | Coordinates | Incidents Count |\n| --- | --- | --- | --- | --- |\n`;
      data.results.forEach(loc => {
        const coords = loc.coordinates ? `[${loc.coordinates[1].toFixed(4)}, ${loc.coordinates[0].toFixed(4)}]` : 'N/A';
        answer += `| **${loc.locationName}** | ${loc.district} | ${loc.division} | \`${coords}\` | **${loc.count}** |\n`;
      });
      summary = `Compiled geographical crime analysis listing showing ${data.count} hotspot locations.`;
      evidence = `Mapped coordinates: [${data.results.map(l => l.locationName).join(', ')}]`;
    } else if (intent === 'Prediction') {
      answer += `### Crime Forecasting & Predictive Analytics Report\n\n`;
      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        if (first && first.historical && first.forecast) {
          answer += `#### Proactive Crime Count Forecast (Next 6 Months):\n\n`;
          answer += `| Month / Year | Predicted Count | Status |\n| --- | --- | --- |\n`;
          first.forecast.forEach(f => {
            answer += `| Month ${f.month} / ${f.year} | **${f.count} cases** | Projected Forecast |\n`;
          });
          summary = `Compiled temporal crime projections forecasting next 6 months counts.`;
        } else if (first && first.predictedRisk) {
          answer += `#### Projected Risk Hotspots:\n\n`;
          answer += `| Location | District | Risk Level | Coords |\n| --- | --- | --- | --- |\n`;
          data.results.forEach(h => {
            const coords = h.coordinates ? `[${h.coordinates[1].toFixed(4)}, ${h.coordinates[0].toFixed(4)}]` : 'N/A';
            answer += `| **${h.locationName}** | ${h.district} | \`${h.predictedRisk}\` | \`${coords}\` |\n`;
          });
          summary = `Compiled spatial risk forecasts displaying ${data.results.length} high-risk zones.`;
        } else if (first && first.severity) {
          answer += `#### Early Warning Threat Alerts:\n\n`;
          data.results.forEach(a => {
            answer += `- **[${a.severity} Warning] ${a.type}**: ${a.description} (*District: ${a.affectedDistrict}*)  \n`;
            answer += `  *Suggested Action: ${a.suggestedAction}*  \n\n`;
          });
          summary = `Compiled early warning threat alerts registry.`;
        }
      }
      evidence = `Forecasting computations completed against MongoDB analytics layers.`;
    } else if (intent === 'Report Generation') {
      const report = data.results[0];
      answer += `### PDF Report Compilation Ready\n\n`;
      answer += `I have successfully compiled the requested **${report.reportType}**.\n\n`;
      answer += `You can download the document by clicking the button below or using the action link:\n\n`;
      answer += `[Download ${report.reportType} PDF](${report.suggestedAction})\n\n`;
      answer += `*Note: PDF documents are generated asynchronously and respect full RBAC security controls.*`;
      summary = `Compiled PDF export parameters for ${report.reportType}.`;
      evidence = `Event logged: REPORT_EXPORT | Action trigger: ${report.suggestedAction}`;
    } else if (intent === 'Offender Profiling') {
      const profile = data.results[0];
      answer += `### Offender Dossier File: ${profile.criminal.name}\n\n`;
      answer += `- **Aliases**: ${profile.criminal.aliases || 'None'}\n`;
      answer += `- **Gang Affiliation**: ${profile.criminal.gang || 'None'}\n`;
      answer += `- **Dynamic Risk Index**: **${profile.risk.level} (${profile.risk.score}/100)**\n`;
      answer += `- **Status**: \`${profile.criminal.arrestStatus}\`\n\n`;
      
      answer += `#### Contributing Risk Factors:\n`;
      profile.risk.factors.forEach(f => {
        answer += `- ${f}\n`;
      });

      answer += `\n#### Behaviour Preferences:\n`;
      answer += `- **Crime Category**: ${profile.preferences.preferredCategory}\n`;
      answer += `- **Location Division**: ${profile.preferences.preferredDistrict}\n`;
      if (profile.preferences.hotspotLocations.length > 0) {
        answer += `- **Hotspots focus**: ${profile.preferences.hotspotLocations.join(', ')}\n`;
      }

      if (profile.associates.length > 0) {
        answer += `\n#### Mapped Associates:\n`;
        profile.associates.forEach(a => {
          answer += `- **${a.name}** (Aliases: ${a.aliases || 'None'}, Shared cases: ${a.sharedCasesCount})\n`;
        });
      }

      summary = `Generated profiling dossier for suspect ${profile.criminal.name}. Threat risk: ${profile.risk.level}.`;
      evidence = `Compiled history over ${profile.timeline.length} cases.`;
    } else if (intent === 'Investigator Decision Support') {
      const support = data.results[0] || {};
      const sum = support.summary || {};
      const recs = support.recommendations || {};
      
      answer += `### Investigator Decision Support Dossier\n\n`;
      answer += `#### Case ${sum.firNumber} Summary:\n`;
      answer += `- **Category**: ${sum.category}\n`;
      answer += `- **Station**: ${sum.stationName}\n`;
      answer += `- **Status**: \`${sum.status}\`\n`;
      answer += `- **Facts**: *${sum.briefFacts}*\n\n`;

      answer += `#### Actionable Recommendations (Priority: ${recs.priority}):\n`;
      recs.recommendations.forEach(r => {
        answer += `- **Action**: ${r.action}  \n  *Rationale*: ${r.rationale}\n`;
      });

      answer += `\n#### Database Evidence Backing:\n`;
      answer += `*${recs.evidenceBacking}*\n`;

      summary = `Compiled investigation summary and ${recs.recommendations?.length || 0} next steps suggestions for Case ${sum.firNumber}.`;
      evidence = `Calculated threat priority level: ${recs.priority}`;
    } else if (intent === 'Similar Cases') {
      answer += `### Similar Case Matches Report\n\n`;
      answer += `Discovered **${data.count} similar historical cases**:\n\n`;
      data.results.forEach((match, idx) => {
        answer += `${idx + 1}. **FIR**: \`${match.firNumber}\` (Similarity: **${Math.round(match.similarityScore * 100)}%**)  \n`;
        answer += `   - **Incident Date**: ${match.date}  \n`;
        answer += `   - **Status**: \`${match.status}\`  \n`;
        answer += `   - **Matching Criteria**: ${match.matchingEvidence.join(', ')}  \n\n`;
      });
      summary = `Matched ${data.count} cases with shared patterns in categories, MO, or locations.`;
      evidence = `Matches: [${data.results.map(m => m.firNumber).join(', ')}]`;
    } else {
      answer += `Located ${data.count} matching records:  \n\`\`\`json\n${JSON.stringify(data.results, null, 2)}\n\`\`\``;
    }

    return {
      answer,
      summary,
      supportingEvidence: evidence,
      confidence: "High (Local Database Verified)",
      suggestedFollowUpQuestions: [
        "Can you query specific details for the first case?",
        "Show physical descriptions for the suspects.",
        "List associated burner phone numbers."
      ]
    };
  }

  /**
   * Generates a structured response from Gemini using contextual inputs
   */
  async generateResponse(history, query, backendData = null, intent = 'General Chat') {
    const startTime = Date.now();
    let ai;
    
    try {
      ai = getGenAIInstance();
    } catch (confError) {
      // Config error (missing key): direct fallback
      return {
        ...this._getFallbackResponse(intent, query, backendData),
        latency: Date.now() - startTime,
        tokens: { totalTokenCount: 0 }
      };
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // 1. Format conversation history parts
    const formattedHistory = this._formatHistory(history);

    // 2. Select and compile prompt
    const promptText = this._getPrompt(intent, query, backendData);

    // 3. Assemble full contents array
    const contents = [...formattedHistory, { role: 'user', parts: [{ text: promptText }] }];

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        logger.info(`AI Request: Calling ${modelName} (Intent: ${intent})`);
        
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: prompts.systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                answer: { type: 'STRING' },
                summary: { type: 'STRING' },
                supportingEvidence: { type: 'STRING' },
                confidence: { type: 'STRING' },
                suggestedFollowUpQuestions: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                }
              },
              required: ['answer', 'summary', 'supportingEvidence', 'suggestedFollowUpQuestions']
            }
          }
        });

        const latency = Date.now() - startTime;
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };

        logger.info(`AI Response: Complete in ${latency}ms. Tokens used: ${usage.totalTokenCount}`);

        try {
          const parsed = JSON.parse(response.text);
          return {
            ...parsed,
            latency,
            tokens: usage
          };
        } catch (parseErr) {
          logger.warn(`AI Response JSON parse failed: ${parseErr.message}`);
          return {
            answer: response.text,
            summary: 'Parsed from unstructured model text.',
            supportingEvidence: 'Extracted context.',
            confidence: 'Medium',
            suggestedFollowUpQuestions: [
              'Can you break down the incident counts?',
              'Show connected suspect profiles.'
            ],
            latency,
            tokens: usage
          };
        }

      } catch (error) {
        retries--;
        logger.warn(`Gemini API error (retries remaining: ${retries}): ${error.message}`);
        
        // Check if it's a rate limit or project quota exhaustion error
        const isRateLimit = error.message.includes('429') || 
                            error.message.includes('RESOURCE_EXHAUSTED') || 
                            (error.status && error.status === 429);
        
        if (retries === 0 || (isRateLimit && retries === 1)) {
          // If we hit the rate limits and have exhausted normal attempts, trigger fallback immediately
          logger.warn('Gemini API exhausted or rate-limited. Falling back to local reasoning formatter...');
          const fallback = this._getFallbackResponse(intent, query, backendData);
          return {
            ...fallback,
            latency: Date.now() - startTime,
            tokens: { totalTokenCount: 0 }
          };
        }

        if (isRateLimit) {
          // Extract requested sleep seconds
          const cooldownMatch = error.message.match(/Please retry in (\d+\.?\d*)s/i);
          let waitTime = 35000; 
          if (cooldownMatch) {
            const seconds = parseFloat(cooldownMatch[1]);
            waitTime = Math.ceil(seconds) * 1000 + 1000;
          }
          
          logger.warn(`Gemini rate limit exceeded. Dynamically pausing for ${waitTime / 1000} seconds to refresh quota...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }
}

export default new GeminiService();
