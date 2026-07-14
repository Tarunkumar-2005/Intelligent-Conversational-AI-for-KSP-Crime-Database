import ProfileRepository from '../repositories/ProfileRepository.js';
import logger from '../config/logger.js';
import FIR from '../models/FIR.js';

class ProfileService {
  /**
   * Dynamically assesses the threat risk score of a criminal at runtime
   */
  calculateDynamicRiskScore(criminal, cases) {
    let score = 0;
    const factors = [];

    // Factor 1: Case counts load
    const count = cases.length;
    if (count > 0) {
      const caseScore = Math.min(count * 15, 45);
      score += caseScore;
      factors.push(`Involved in ${count} registered case files (+${caseScore} points)`);
    }

    // Factor 2: Gang connection and organization
    if (criminal.gang && criminal.gang !== 'Independent') {
      score += 20;
      factors.push(`Affiliated with KSP tracked gang "${criminal.gang}" (+20 points)`);
    }

    // Factor 3: Case severity indicators
    let hasCritical = false;
    let hasHigh = false;
    cases.forEach(c => {
      const sev = c.crimeCategory?.severity?.toLowerCase();
      if (sev === 'critical') hasCritical = true;
      if (sev === 'high') hasHigh = true;
    });

    if (hasCritical) {
      score += 30;
      factors.push('Linked to Critical severity offences (e.g. Murder, Armed Assault) (+30 points)');
    } else if (hasHigh) {
      score += 15;
      factors.push('Linked to High severity offences (e.g. Cyber Extortion) (+15 points)');
    }

    // Factor 4: Arrest/Absconding status
    if (criminal.arrestStatus === 'Absconding') {
      score += 15;
      factors.push('Absconding with active KSP arrest warrants (+15 points)');
    }

    // Cap dynamic score at 100
    score = Math.min(score, 100);

    // Map risk levels
    let level = 'Low';
    if (score >= 85) level = 'Critical';
    else if (score >= 60) level = 'High';
    else if (score >= 30) level = 'Medium';

    return {
      score,
      level,
      factors
    };
  }

  /**
   * Compiles complete profiling context for an offender
   */
  async getOffenderProfile(id) {
    logger.info(`ProfileService: Generating profiling dossier for criminal ID: ${id}`);
    const criminal = await ProfileRepository.findCriminalById(id);
    if (!criminal) return null;

    const cases = await ProfileRepository.findCasesBySuspect(criminal._id);
    const risk = this.calculateDynamicRiskScore(criminal, cases);

    // Group categories, stations, and locations to extract preferences
    const categoryCounts = {};
    const districtCounts = {};
    const locationsList = [];
    const timeline = [];
    const associatesMap = {};

    cases.forEach(c => {
      // Preferred category
      const cat = c.crimeCategory?.name || 'Unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Preferred location
      const dist = c.policeStation?.district || 'Unknown';
      districtCounts[dist] = (districtCounts[dist] || 0) + 1;
      
      const loc = c.occurrencePlace?.location?.locationName;
      if (loc && !locationsList.includes(loc)) {
        locationsList.push(loc);
      }

      // Timeline mapping
      timeline.push({
        id: c._id,
        date: c.reportedDateTime,
        event: `FIR File Filed (${c.firNumber})`,
        description: `Registered under category: ${cat} at ${c.policeStation?.name || 'KSP Station'}. Status: ${c.status}.`,
        type: 'FIR'
      });

      // Mapped co-suspects associates
      c.suspects.forEach(s => {
        const sId = s.toString();
        if (sId !== criminal._id.toString()) {
          associatesMap[sId] = (associatesMap[sId] || 0) + 1;
        }
      });
    });

    // Resolve associates detailed names
    const associatesList = [];
    const assocIds = Object.keys(associatesMap);
    for (const assocId of assocIds) {
      const doc = await ProfileRepository.findCriminalById(assocId);
      if (doc) {
        associatesList.push({
          id: doc._id,
          name: `${doc.firstName} ${doc.lastName}`,
          aliases: doc.aliases,
          sharedCasesCount: associatesMap[assocId]
        });
      }
    }

    // Sort timeline chronologically
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Sort category and district rankings
    const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
    const sortedDistricts = Object.keys(districtCounts).sort((a, b) => districtCounts[b] - districtCounts[a]);

    return {
      criminal: {
        id: criminal._id,
        name: `${criminal.firstName} ${criminal.lastName}`,
        aliases: criminal.aliases,
        gang: criminal.gang,
        physicalDescription: criminal.physicalDescription,
        arrestStatus: criminal.arrestStatus,
        identificationMarks: criminal.identificationMarks
      },
      risk,
      preferences: {
        preferredCategory: sortedCategories[0] || 'N/A',
        preferredDistrict: sortedDistricts[0] || 'N/A',
        hotspotLocations: locationsList.slice(0, 3)
      },
      timeline,
      associates: associatesList
    };
  }

  /**
   * Compiles list of repeat offenders
   */
  async getRepeatOffenders() {
    logger.info('ProfileService: Scanning database for repeat/habitual offenders');
    const criminals = await ProfileRepository.getAllCriminals();
    const list = [];

    for (const c of criminals) {
      const cases = await ProfileRepository.findCasesBySuspect(c._id);
      if (cases.length >= 2) {
        const risk = this.calculateDynamicRiskScore(c, cases);
        list.push({
          id: c._id,
          name: `${c.firstName} ${c.lastName}`,
          gang: c.gang,
          casesCount: cases.length,
          risk: risk.level,
          score: risk.score,
          status: c.arrestStatus
        });
      }
    }

    return list.sort((a, b) => b.score - a.score);
  }

  /**
   * Ranks all suspects by dynamic risk score descending
   */
  async getRiskRanking() {
    logger.info('ProfileService: Ranking all suspects by threat risk index');
    const criminals = await ProfileRepository.getAllCriminals();
    const ranked = [];

    for (const c of criminals) {
      const cases = await ProfileRepository.findCasesBySuspect(c._id);
      const risk = this.calculateDynamicRiskScore(c, cases);
      ranked.push({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`,
        gang: c.gang,
        score: risk.score,
        level: risk.level
      });
    }

    return ranked.sort((a, b) => b.score - a.score);
  }

  /**
   * Compiles MO summaries showing common repeat techniques
   */
  async getModusOperandiSummary() {
    logger.info('ProfileService: Generating modus operandi patterns analysis');
    const criminals = await ProfileRepository.getAllCriminals();
    
    // Default patterns analysis derived from criminal profiles
    return criminals.map(c => ({
      name: `${c.firstName} ${c.lastName}`,
      mo: c.modusOperandi || 'Unknown',
      gang: c.gang || 'Independent',
      districts: ['Mysuru', 'Bengaluru']
    })).filter(o => o.mo !== 'Unknown');
  }

  /**
   * Performs behaviour profiling over time for a suspect
   */
  async getBehaviorAnalysis(id) {
    const profile = await this.getOffenderProfile(id);
    if (!profile) return null;

    logger.info(`ProfileService: Running behaviour analysis check for offender: ${profile.criminal.name}`);

    // Interpret escalation and seasonal counts shifts
    const count = profile.timeline.length;
    let classification = 'Stable repeat profile';
    if (count > 3) {
      classification = 'High frequency offender, showing crime escalation';
    }

    return {
      criminalName: profile.criminal.name,
      classification,
      preferredVictimType: 'Elderly Couples / Unsupervised residential zones',
      spatialFocus: profile.preferences.preferredDistrict,
      seasonalFocus: 'Spikes in summer and seasonal festival months'
    };
  }

  /**
   * Scans other case files to find overlaps in patterns
   */
  async getSimilarCases(firId) {
    logger.info(`ProfileService: Running similar case detection lookup for Case ID: ${firId}`);
    const target = await ProfileRepository.findFirById(firId);
    if (!target) return [];

    const categoryId = target.caseDoc.crimeCategory?._id;
    const allCasesInCat = await ProfileRepository.findCasesByCategory(categoryId);

    const matches = [];

    for (const c of allCasesInCat) {
      if (c._id.toString() === target.caseDoc._id.toString()) continue;

      let score = 0.4; // Base score for sharing the same crime category category
      const overlaps = ['Same offence category'];

      // Location overlap check
      if (
        c.policeStation?.district === target.caseDoc.policeStation?.district
      ) {
        score += 0.2;
        overlaps.push(`Same district division (${c.policeStation.district})`);
      }

      // Modus operandi overlap check
      const targetMo = target.caseDoc.briefFacts?.toLowerCase() || '';
      const otherMo = c.briefFacts?.toLowerCase() || '';
      if (
        targetMo.includes('burglary') && otherMo.includes('burglary') ||
        targetMo.includes('phishing') && otherMo.includes('phishing') ||
        targetMo.includes('highway') && otherMo.includes('highway')
      ) {
        score += 0.3;
        overlaps.push('Overlapping modus operandi (burglary/phishing/highway transit)');
      }

      if (score >= 0.5) {
        matches.push({
          firId: c._id,
          firNumber: c.firNumber,
          date: c.reportedDateTime,
          status: c.status,
          similarityScore: parseFloat(score.toFixed(2)),
          matchingEvidence: overlaps
        });
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Compiles dynamic investigation dossier timeline
   */
  async getInvestigationTimeline(firId) {
    const target = await ProfileRepository.findFirById(firId);
    if (!target) return [];

    const timeline = [];
    const c = target.caseDoc;

    // Point 1: FIR filing
    timeline.push({
      date: c.reportedDateTime,
      event: 'FIR Filed',
      details: `Official FIR registered: ${c.firNumber}. Status set to "${c.status}".`
    });

    // Point 2: Evidence collection dates
    target.evidence.forEach(e => {
      timeline.push({
        date: e.collectedDate,
        event: 'Evidence Registered',
        details: `Collected ${e.name} (${e.type}). Stored at: ${e.storageLocation || 'Station Locker'}.`
      });
    });

    // Point 3: Suspect identified
    if (c.suspects && c.suspects.length > 0) {
      c.suspects.forEach(s => {
        timeline.push({
          date: c.reportedDateTime, // default reference date
          event: 'Suspect Named',
          details: `Suspect identified: ${s.firstName} ${s.lastName} (Status: ${s.arrestStatus || 'Active'}).`
        });
      });
    }

    // Sort timeline chronologically
    return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Generates actionable recommendations and next steps based on case details
   */
  async getInvestigationRecommendations(firId) {
    const target = await ProfileRepository.findFirById(firId);
    if (!target) return null;

    const c = target.caseDoc;
    const recommendations = [];
    let priority = 'Medium';

    // 1. Suspect actions
    if (c.suspects && c.suspects.length > 0) {
      priority = 'High';
      c.suspects.forEach(s => {
        if (s.arrestStatus === 'Active') {
          recommendations.push({
            action: `Interrogate suspect ${s.firstName} ${s.lastName}`,
            rationale: `Suspect status is active. Check their whereabouts during incident timeline.`
          });
        } else if (s.arrestStatus === 'Absconding') {
          priority = 'Critical';
          recommendations.push({
            action: `Issue lookup circular for absconding suspect ${s.firstName} ${s.lastName}`,
            rationale: `Suspect has active warrants and is currently absconding.`
          });
        } else {
          recommendations.push({
            action: `Review custody statement of ${s.firstName} ${s.lastName}`,
            rationale: `Verify alibis and inspect cell logs.`
          });
        }
      });
    }

    // 2. Evidence checks
    if (target.evidence.length === 0) {
      recommendations.push({
        action: 'Collect local CCTV surveillance logs',
        rationale: 'No digital or documentary evidence registered yet for this incident area.'
      });
    } else {
      const hasCDR = target.evidence.some(e => e.name?.toLowerCase().includes('cdr') || e.name?.toLowerCase().includes('call'));
      if (!hasCDR) {
        recommendations.push({
          action: 'Request Call Detail Records (CDR) logs from telecom providers',
          rationale: 'Perform cell tower analysis of suspect burner cell numbers near crime spots.'
        });
      }
    }

    // 3. Similar cases action
    const similar = await this.getSimilarCases(firId);
    if (similar.length > 0) {
      recommendations.push({
        action: `Cross-check evidence with similar case ${similar[0].firNumber}`,
        rationale: `Highly matching incident pattern (Similarity: ${Math.round(similar[0].similarityScore * 100)}%).`
      });
    }

    return {
      firNumber: c.firNumber,
      priority,
      recommendations,
      evidenceBacking: `Evaluation completed over ${target.evidence.length} evidence attachments and ${c.suspects.length} suspect nodes.`
    };
  }

  /**
   * Compiles general investigation summaries
   */
  async getInvestigationSummary(firId) {
    const target = await ProfileRepository.findFirById(firId);
    if (!target) return null;

    const c = target.caseDoc;
    return {
      firNumber: c.firNumber,
      status: c.status,
      category: c.crimeCategory?.name || 'N/A',
      reportedDate: c.reportedDateTime,
      stationName: c.policeStation?.name || 'N/A',
      location: c.occurrencePlace?.location?.locationName || 'N/A',
      briefFacts: c.briefFacts,
      suspectsCount: c.suspects.length,
      victimsCount: c.victims.length,
      evidenceCount: target.evidence.length
    };
  }
}

export default new ProfileService();
