class QueryParser {
  /**
   * Extracts filters from a user message string
   * @param {string} text - User message content
   */
  parse(text) {
    if (!text || !text.trim()) return {};

    const query = text.toLowerCase();
    const filters = {};

    // 1. Detect City/District
    if (query.includes('bengaluru') || query.includes('bangalore')) filters.city = 'Bengaluru';
    else if (query.includes('mysuru') || query.includes('mysore')) filters.city = 'Mysuru';
    else if (query.includes('mandya')) filters.city = 'Mandya';
    else if (query.includes('tumakuru') || query.includes('tumkur')) filters.city = 'Tumakuru';

    // 2. Detect Crime Type / Category
    if (query.includes('robbery')) filters.crimeType = 'Robbery';
    else if (query.includes('theft') || query.includes('burglary')) filters.crimeType = 'Theft';
    else if (query.includes('cyber') || query.includes('phishing') || query.includes('telegram')) filters.crimeType = 'Cyber Crime';
    else if (query.includes('fraud') || query.includes('scam') || query.includes('scams')) filters.crimeType = 'Fraud';
    else if (query.includes('assault')) filters.crimeType = 'Assault';

    // 3. Detect Year
    const yearMatch = text.match(/\b(202\d)\b/);
    if (yearMatch) {
      filters.year = parseInt(yearMatch[1], 10);
    }

    // 4. Detect Month
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june', 
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    for (let i = 0; i < months.length; i++) {
      if (query.includes(months[i])) {
        filters.month = i + 1; // 1-indexed
        break;
      }
    }

    // 5. Detect FIR Number
    const firMatch = text.match(/FIR\/[A-Z0-9\-]+\/\d{4}\/\d+/i) || text.match(/FIR-?\d+/i);
    if (firMatch) {
      filters.firNumber = firMatch[0].toUpperCase();
    }

    // 5b. Detect Evidence ID
    const evdMatch = text.match(/EVD-\d{4}-\d{5}/i);
    if (evdMatch) {
      filters.evidenceId = evdMatch[0].toUpperCase();
    }

    // 6. Detect Name and Entity (Criminal / Suspect / Victim / Complainant)
    if (query.includes('victim') || query.includes('complainant')) {
      filters.entity = 'Victim';
    } else if (query.includes('criminal') || query.includes('suspect') || query.includes('offender') || query.includes('history of') || query.includes('record of')) {
      filters.entity = 'Criminal';
    }

    const namePatterns = [
      /associates?\s+of\s+(\w+)/i,
      /connections?\s+of\s+(\w+)/i,
      /network\s+of\s+(\w+)/i,
      /network\s+for\s+(\w+)/i,
      /find\s+criminal\s+(\w+)/i,
      /find\s+suspect\s+(\w+)/i,
      /find\s+victim\s+(\w+)/i,
      /find\s+(\w+)/i,
      /history\s+of\s+(\w+)/i,
      /record\s+of\s+(\w+)/i,
      /criminal\s+named\s+(\w+)/i,
      /victim\s+named\s+(\w+)/i
    ];

    const fillers = [
      'a', 'the', 'some', 'recent', 'all', 'any', 'my', 'his', 'her', 'their', 
      'cases', 'firs', 'crimes', 'status', 'history', 'offenders', 'offender', 
      'repeat', 'complainants', 'victim', 'complainant', 'criminal', 'suspect'
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const nameCandidate = match[1].toLowerCase();
        if (!fillers.includes(nameCandidate)) {
          filters.name = nameCandidate.charAt(0).toUpperCase() + nameCandidate.slice(1);
          
          // Set default entity guess based on known victim/criminal hints
          if (!filters.entity) {
            if (['rahul', 'deepti'].includes(nameCandidate)) {
              filters.entity = 'Victim';
            } else {
              filters.entity = 'Criminal';
            }
          }
          break;
        }
      }
    }

    return filters;
  }
}

export default new QueryParser();
