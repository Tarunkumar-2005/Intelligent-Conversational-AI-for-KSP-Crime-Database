class QueryRouter {
  constructor() {
    // Keyword catalogs for intent classification.
    // Specifying more specific intents at the beginning of the list resolves keyword tie-breakers.
    this.intentMap = [
      {
        intent: 'Offender Profiling',
        requiredService: 'ProfileService',
        keywords: [
          'profile criminal', 'profile offender', 'why is this offender high risk', 
          'show modus operandi', 'offender profile', 'criminal profile', 'risk level', 
          'profile', 'behavior analysis', 'habitual offender'
        ]
      },
      {
        intent: 'Investigator Decision Support',
        requiredService: 'ProfileService',
        keywords: [
          'investigation summary', 'suggest investigation leads', 'investigation leads', 
          'what evidence is still missing', 'what should the investigating officer do next', 
          'officer next steps', 'leads', 'recommendations', 'actionable leads', 'next steps'
        ]
      },
      {
        intent: 'Similar Cases',
        requiredService: 'ProfileService',
        keywords: [
          'similar cases', 'find similar cases', 'similar case', 'similar historical cases'
        ]
      },
      {
        intent: 'Report Generation',
        requiredService: 'ReportService',
        keywords: [
          'report', 'reports', 'export', 'pdf', 'download', 'generate report',
          'generate reports', 'export conversation', 'download pdf'
        ]
      },
      {
        intent: 'Case Summary',
        requiredService: 'CaseSummaryService',
        keywords: ['summary', 'summarize', 'brief', 'report summary', 'summaries']
      },
      {
        intent: 'Analytics',
        requiredService: 'AnalyticsService',
        keywords: [
          'analytics', 'stats', 'statistics', 'charts', 'chart', 'distribution', 
          'percentage', 'breakdown', 'rate', 'rates', 'trend', 'trends',
          'district', 'districts', 'highest', 'lowest', 'most', 'least', 
          'compare', 'comparison', 'ranking', 'rankings', 'top'
        ]
      },
      {
        intent: 'Crime Hotspots',
        requiredService: 'MapService',
        keywords: [
          'hotspot', 'hotspots', 'map', 'maps', 'geographic', 'geospatial', 
          'density', 'near', 'concentration', 'concentrated', 'repeated crimes',
          'crime density'
        ]
      },
      {
        intent: 'Prediction',
        requiredService: 'PredictionService',
        keywords: [
          'prediction', 'predictions', 'forecast', 'forecasts', 'predict', 
          'forecasting', 'early warning', 'projected', 'expected', 'increase',
          'increasing', 'projections', 'future', 'next month'
        ]
      },
      {
        intent: 'Network Analysis',
        requiredService: 'NetworkAnalysisService',
        keywords: [
          'network', 'networks', 'connection', 'connections', 'link', 'links', 
          'relationship', 'relationships', 'graph', 'graphs', 'associates', 
          'associate', 'accomplice', 'accomplices', 'gang', 'gangs', 'clique',
          'cliques', 'share', 'shared', 'same', 'common', 'interconnected'
        ]
      },
      {
        intent: 'Criminal Search',
        requiredService: 'CriminalSearchService',
        keywords: [
          'criminal', 'criminals', 'suspect', 'suspects', 'gang', 'gangs', 
          'offender', 'offenders', 'shekhar', 'ramesh', 'suresh', 
          'accomplice', 'accomplices'
        ]
      },
      {
        intent: 'Victim Search',
        requiredService: 'VictimSearchService',
        keywords: ['victim', 'victims', 'complainant', 'complainants', 'injured', 'victim list', 'deepti']
      },
      {
        intent: 'Crime Search',
        requiredService: 'CrimeSearchService',
        keywords: [
          'fir', 'firs', 'crime', 'crimes', 'robbery', 'robberies', 
          'theft', 'thefts', 'burglary', 'burglaries', 'assault', 'assaults', 
          'bns', 'ipc', 'case', 'cases', 'incident', 'incidents',
          'investigation', 'status', 'stage', 'phase'
        ]
      },
      {
        intent: 'General Chat',
        requiredService: 'GeneralChatService',
        keywords: ['hello', 'hi', 'hey', 'greeting', 'help', 'how are you', 'assistant']
      }
    ];
  }

  /**
   * Classifies user input text into a category intent with confidence score
   * @param {string} text - User message content
   */
  classify(text) {
    if (!text || !text.trim()) {
      return {
        intent: 'Unknown',
        confidence: 0.0,
        requiredService: 'FallbackService'
      };
    }

    const lowerText = text.toLowerCase();
    
    // Command overrides
    if (lowerText.includes('profile') || lowerText.includes('behaviour') || lowerText.includes('habitual')) {
      return {
        intent: 'Offender Profiling',
        confidence: 0.95,
        requiredService: 'ProfileService'
      };
    }
    if (lowerText.includes('recommendation') || lowerText.includes('leads') || lowerText.includes('next steps') || lowerText.includes('what should the investigating officer') || lowerText.includes('missing evidence') || lowerText.includes('investigation summary')) {
      return {
        intent: 'Investigator Decision Support',
        confidence: 0.95,
        requiredService: 'ProfileService'
      };
    }
    if (lowerText.includes('similar')) {
      return {
        intent: 'Similar Cases',
        confidence: 0.95,
        requiredService: 'ProfileService'
      };
    }

    const cleanText = lowerText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const words = cleanText.split(/\s+/);
    
    let bestIntent = 'Unknown';
    let maxMatches = 0;
    let requiredService = 'FallbackService';

    // Count matching keywords across classes
    for (const mapping of this.intentMap) {
      let matches = 0;
      for (const word of words) {
        if (mapping.keywords.includes(word)) {
          matches++;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestIntent = mapping.intent;
        requiredService = mapping.requiredService;
      }
    }

    // Determine confidence metric based on keyword matches count
    let confidence = 0.0;
    if (maxMatches > 0) {
      // Calculate realistic confidence capping it at 0.95 for rules engine
      confidence = Math.min(0.5 + (maxMatches * 0.15), 0.95);
    } else {
      // Check if the query is a simple conversational query or unknown
      const conversationKeywords = ['thank', 'thanks', 'bye', 'ok', 'okay'];
      const hasConv = words.some(w => conversationKeywords.includes(w));
      if (hasConv) {
        bestIntent = 'General Chat';
        confidence = 0.8;
        requiredService = 'GeneralChatService';
      }
    }

    return {
      intent: bestIntent,
      confidence,
      requiredService
    };
  }
}

export default new QueryRouter();
