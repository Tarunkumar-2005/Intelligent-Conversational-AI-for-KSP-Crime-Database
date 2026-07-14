import ConversationRepository from '../repositories/ConversationRepository.js';
import ChatRepository from '../repositories/ChatRepository.js';
import QueryRouter from './QueryRouter.js';
import QueryParser from './QueryParser.js';
import GeminiService from './geminiService.js';
import FIRService from './FIRService.js';
import CriminalService from './CriminalService.js';
import VictimService from './VictimService.js';
import EvidenceService from './EvidenceService.js';
import SummaryService from './SummaryService.js';
import AnalyticsService from './AnalyticsService.js';
import NetworkService from './NetworkService.js';
import MapService from './MapService.js';
import PredictionService from './PredictionService.js';
import ProfileService from './ProfileService.js';
import Criminal from '../models/Criminal.js';
import Victim from '../models/Victim.js';
import Vehicle from '../models/Vehicle.js';
import PhoneNumber from '../models/PhoneNumber.js';
import BankAccount from '../models/BankAccount.js';
import FIR from '../models/FIR.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

class ChatService {
  /**
   * Initializes a fresh active conversation thread
   */
  async createConversation(userId, title) {
    const session = await ConversationRepository.create(userId, title);
    logger.info(`Conversation Created: ID ${session._id} for user ${userId}`);
    return session;
  }

  /**
   * Retrieves active conversation threads belonging to the user
   */
  async getConversations(userId) {
    const list = await ConversationRepository.findActiveByUserId(userId);
    logger.info(`Conversations Retrieved: Found ${list.length} threads for user ${userId}`);
    return list;
  }

  /**
   * Retrieves a specific conversation thread ensuring ownership validation
   */
  async getConversationById(id, userId) {
    const session = await ConversationRepository.findById(id);
    
    if (!session) {
      throw new AppError('Conversation thread not found.', 404);
    }
    if (session.status === 'soft-deleted') {
      throw new AppError('This conversation thread has been deleted.', 410);
    }
    if (session.user.toString() !== userId.toString()) {
      throw new AppError('Unauthorized access to this conversation dossier.', 403);
    }

    logger.info(`Conversation Retrieved: ID ${session._id}`);
    return session;
  }

  /**
   * Updates conversation properties (e.g. renaming the title)
   */
  async updateConversation(id, userId, title) {
    const session = await this.getConversationById(id, userId);
    return await ConversationRepository.update(session._id, { title });
  }

  /**
   * Deactivates a conversation thread via soft-deletion
   */
  async deleteConversation(id, userId) {
    const session = await this.getConversationById(id, userId);
    const deleted = await ConversationRepository.softDelete(session._id);
    logger.info(`Conversation Deleted: ID ${deleted._id}`);
    return deleted;
  }

  /**
   * Registers a user message, runs classification, parses filters, queries MongoDB, passes to Gemini, and updates history
   */
  async sendMessage(id, userId, content) {
    // 1. Fetch and validate session exists and user has ownership
    const session = await this.getConversationById(id, userId);

    const cleanContent = content ? content.trim() : '';
    if (!cleanContent) {
      throw new AppError('Message content cannot be empty.', 400);
    }

    if (cleanContent.length > 5000) {
      throw new AppError('Message length exceeds security maximum limit of 5000 characters.', 400);
    }

    // 2. Query Router Intent Classification
    const classification = QueryRouter.classify(cleanContent);
    
    // 3. Query Parser Filter Extraction
    const filters = QueryParser.parse(cleanContent);
    logger.info(`Detected Intent: ${classification.intent} | Query: "${cleanContent}" | Filters: ${JSON.stringify(filters)}`);

    // 4. Connect to business service layer to run MongoDB queries
    let queryResult = {
      intent: classification.intent,
      results: [],
      count: 0,
      executionTime: 0
    };

    try {
      // Determine target service based on intent & extracted entities
      if (cleanContent.toLowerCase().includes('evidence') || filters.evidenceId) {
        queryResult = await EvidenceService.searchEvidence(filters);
      } else if (classification.intent === 'Crime Search') {
        if (filters.firNumber) {
          queryResult = await FIRService.getFIRDetails(filters.firNumber);
        } else if (cleanContent.toLowerCase().includes('investigation status') || cleanContent.toLowerCase().includes('investigating status')) {
          queryResult = await FIRService.getInvestigationStatus();
        } else {
          queryResult = await FIRService.searchFIRs(filters);
        }
      } else if (classification.intent === 'Criminal Search') {
        if (cleanContent.toLowerCase().includes('repeat offender')) {
          queryResult = await CriminalService.getRepeatOffenders();
        } else {
          queryResult = await CriminalService.searchCriminals(filters);
        }
      } else if (classification.intent === 'Victim Search') {
        queryResult = await VictimService.searchVictims(filters);
      } else if (classification.intent === 'Case Summary') {
        queryResult = await SummaryService.generateSummary();
      } else if (classification.intent === 'Analytics') {
        const lowerContent = cleanContent.toLowerCase();
        if (lowerContent.includes('trend') || lowerContent.includes('timeline') || lowerContent.includes('over time') || lowerContent.includes('monthly trends')) {
          const data = await AnalyticsService.getCrimeTrends(filters);
          queryResult = { intent: 'Analytics', results: data, count: data.length, executionTime: 0 };
        } else if (lowerContent.includes('district') || lowerContent.includes('districts') || lowerContent.includes('highest robbery cases') || lowerContent.includes('division')) {
          const data = await AnalyticsService.getDistricts(filters);
          queryResult = { intent: 'Analytics', results: data, count: data.length, executionTime: 0 };
        } else if (lowerContent.includes('category') || lowerContent.includes('categories') || lowerContent.includes('type') || lowerContent.includes('types') || lowerContent.includes('cyber')) {
          const data = await AnalyticsService.getCrimeTypes(filters);
          queryResult = { intent: 'Analytics', results: data, count: data.length, executionTime: 0 };
        } else if (lowerContent.includes('investigation status') || lowerContent.includes('status') || lowerContent.includes('active') || lowerContent.includes('closed')) {
          const data = await AnalyticsService.getInvestigationStatus(filters);
          queryResult = { intent: 'Analytics', results: data, count: data.length, executionTime: 0 };
        } else if (lowerContent.includes('station') || lowerContent.includes('stations')) {
          const data = await AnalyticsService.getPoliceStations(filters);
          queryResult = { intent: 'Analytics', results: data, count: data.length, executionTime: 0 };
        } else if (lowerContent.includes('location') || lowerContent.includes('locations') || lowerContent.includes('hotspot') || lowerContent.includes('hotspots')) {
          const data = await AnalyticsService.getTopCrimeLocations(filters);
          queryResult = { intent: 'Analytics', results: data, count: data.length, executionTime: 0 };
        } else {
          const data = await AnalyticsService.getOverview(filters);
          queryResult = { intent: 'Analytics', results: [data], count: 1, executionTime: 0 };
        }
      } else if (classification.intent === 'Prediction') {
        const lowerContent = cleanContent.toLowerCase();
        const district = filters.city || (lowerContent.includes('bengaluru') ? 'Bengaluru' : lowerContent.includes('mysuru') ? 'Mysuru' : lowerContent.includes('mandya') ? 'Mandya' : lowerContent.includes('tumakuru') ? 'Tumakuru' : null);
        const params = {};
        if (district) params.district = district;

        const category = filters.crimeType || (lowerContent.includes('robbery') ? 'Robbery' : lowerContent.includes('theft') ? 'Theft' : lowerContent.includes('cyber') ? 'Cyber Crime' : lowerContent.includes('fraud') ? 'Fraud' : lowerContent.includes('assault') ? 'Assault' : null);
        if (category) params.crimeCategory = category;

        if (lowerContent.includes('hotspot') || lowerContent.includes('location') || lowerContent.includes('risk')) {
          const hotspots = await PredictionService.getHotspots(params);
          queryResult = {
            intent: 'Prediction',
            results: hotspots,
            count: hotspots.length,
            executionTime: 0
          };
        } else if (lowerContent.includes('alert') || lowerContent.includes('warning') || lowerContent.includes('warnings')) {
          const alerts = await PredictionService.getAlerts(params);
          queryResult = {
            intent: 'Prediction',
            results: alerts,
            count: alerts.length,
            executionTime: 0
          };
        } else {
          const trends = await PredictionService.getTrends(params);
          queryResult = {
            intent: 'Prediction',
            results: [trends],
            count: 1,
            executionTime: 0
          };
        }
      } else if (classification.intent === 'Network Analysis') {
        let graph = null;
        let insights = {};
        
        // 1. Identify target node
        if (filters.firNumber) {
          const firDoc = await FIR.findOne({ firNumber: new RegExp(filters.firNumber.trim(), 'i') });
          if (firDoc) {
            graph = await NetworkService.getFIRNeighborhood(firDoc._id);
          }
        } else if (filters.name) {
          const crimDoc = await Criminal.findOne({ 
            $or: [
              { firstName: new RegExp(filters.name.trim(), 'i') },
              { lastName: new RegExp(filters.name.trim(), 'i') }
            ]
          });
          if (crimDoc) {
            graph = await NetworkService.getCriminalNeighborhood(crimDoc._id);
          } else {
            const vicDoc = await Victim.findOne({
              $or: [
                { firstName: new RegExp(filters.name.trim(), 'i') },
                { lastName: new RegExp(filters.name.trim(), 'i') }
              ]
            });
            if (vicDoc) {
              const firDoc = await FIR.findOne({ victims: vicDoc._id });
              if (firDoc) {
                graph = await NetworkService.getFIRNeighborhood(firDoc._id);
              }
            }
          }
        }

        // Check regex for vehicle
        const vehicleMatch = cleanContent.match(/\b[A-Z]{2}[ -]?\d{2}[ -]?[A-Z]{1,3}[ -]?\d{4}\b/i);
        if (!graph && vehicleMatch) {
          const vehDoc = await Vehicle.findOne({ vehicleNumber: new RegExp(vehicleMatch[0].trim(), 'i') });
          if (vehDoc) {
            graph = await NetworkService.getVehicleNeighborhood(vehDoc._id);
          }
        }

        // Check phone number
        const phoneMatch = cleanContent.match(/\b\d{10}\b/);
        if (!graph && phoneMatch) {
          const phDoc = await PhoneNumber.findOne({ phoneNumber: new RegExp(phoneMatch[0].trim(), 'i') });
          if (phDoc) {
            graph = await NetworkService.getPhoneNeighborhood(phDoc._id);
          }
        }

        // Check bank account
        const bankMatch = cleanContent.match(/\b\d{9,18}\b/);
        if (!graph && bankMatch) {
          const bankDoc = await BankAccount.findOne({ accountNumber: new RegExp(bankMatch[0].trim(), 'i') });
          if (bankDoc) {
            graph = await NetworkService.getBankNeighborhood(bankDoc._id);
          }
        }

        // 2. Default fallback: Shekhar (gang leader) or first criminal in database
        if (!graph) {
          const shekhar = await Criminal.findOne({ firstName: /Shekhar/i }) || await Criminal.findOne();
          if (shekhar) {
            graph = await NetworkService.getCriminalNeighborhood(shekhar._id);
          }
        }

        if (graph) {
          insights = NetworkService.getNetworkInsights(graph);
          queryResult = {
            intent: 'Network Analysis',
            results: [graph],
            count: graph.nodes.length,
            insights,
            executionTime: 0
          };
        } else {
          queryResult = {
            intent: 'Network Analysis',
            results: [],
            count: 0,
            insights: {},
            executionTime: 0
          };
        }
      } else if (classification.intent === 'Crime Hotspots') {
        const lowerContent = cleanContent.toLowerCase();
        const district = filters.city || (lowerContent.includes('bengaluru') ? 'Bengaluru' : lowerContent.includes('mysuru') ? 'Mysuru' : lowerContent.includes('mandya') ? 'Mandya' : lowerContent.includes('tumakuru') ? 'Tumakuru' : null);
        const params = {};
        if (district) params.district = district;
        if (filters.crimeType) params.crimeCategory = filters.crimeType;

        const hotspots = await MapService.getHotspots(params);
        queryResult = {
          intent: 'Crime Hotspots',
          results: hotspots,
          count: hotspots.length,
          executionTime: 0
        };
      } else if (classification.intent === 'Offender Profiling') {
        const lowerContent = cleanContent.toLowerCase();
        let targetCrim = null;
        if (filters.name) {
          const rx = new RegExp(filters.name.trim(), 'i');
          targetCrim = await Criminal.findOne({ $or: [{ firstName: rx }, { lastName: rx }, { aliases: rx }] });
        }
        if (!targetCrim) {
          const words = lowerContent.split(/\s+/);
          for (const w of words) {
            if (w.length > 3) {
              const rx = new RegExp(w, 'i');
              targetCrim = await Criminal.findOne({ $or: [{ firstName: rx }, { lastName: rx }, { aliases: rx }] });
              if (targetCrim) break;
            }
          }
        }
        if (!targetCrim) {
          targetCrim = await Criminal.findOne({ firstName: /Ramesh/i }) || await Criminal.findOne();
        }

        if (targetCrim) {
          const profile = await ProfileService.getOffenderProfile(targetCrim._id);
          queryResult = {
            intent: 'Offender Profiling',
            results: [profile],
            count: 1,
            executionTime: 0
          };
        } else {
          queryResult = {
            intent: 'Offender Profiling',
            results: [],
            count: 0,
            executionTime: 0
          };
        }
      } else if (classification.intent === 'Investigator Decision Support') {
        let targetFir = null;
        if (filters.firNumber) {
          targetFir = await FIR.findOne({ firNumber: new RegExp(filters.firNumber.trim(), 'i') });
        }
        if (!targetFir) {
          targetFir = await FIR.findOne({ status: 'Active' }) || await FIR.findOne();
        }

        if (targetFir) {
          const summary = await ProfileService.getInvestigationSummary(targetFir._id);
          const recommendations = await ProfileService.getInvestigationRecommendations(targetFir._id);
          const timeline = await ProfileService.getInvestigationTimeline(targetFir._id);
          queryResult = {
            intent: 'Investigator Decision Support',
            results: [{ summary, recommendations, timeline }],
            count: 1,
            executionTime: 0
          };
        } else {
          queryResult = {
            intent: 'Investigator Decision Support',
            results: [],
            count: 0,
            executionTime: 0
          };
        }
      } else if (classification.intent === 'Similar Cases') {
        let targetFir = null;
        if (filters.firNumber) {
          targetFir = await FIR.findOne({ firNumber: new RegExp(filters.firNumber.trim(), 'i') });
        }
        if (!targetFir) {
          targetFir = await FIR.findOne({ status: 'Active' }) || await FIR.findOne();
        }

        if (targetFir) {
          const matches = await ProfileService.getSimilarCases(targetFir._id);
          queryResult = {
            intent: 'Similar Cases',
            results: matches,
            count: matches.length,
            executionTime: 0
          };
        } else {
          queryResult = {
            intent: 'Similar Cases',
            results: [],
            count: 0,
            executionTime: 0
          };
        }
      } else if (classification.intent === 'Report Generation') {
        const lowerContent = cleanContent.toLowerCase();
        let reportType = 'Chat Export';
        let suggestedAction = 'DOWNLOAD_CHAT_PDF';

        if (lowerContent.includes('investigation') || lowerContent.includes('case') || lowerContent.includes('dossier')) {
          reportType = 'Investigation Case Dossier';
          suggestedAction = 'DOWNLOAD_INVESTIGATION_PDF';
        } else if (lowerContent.includes('analytics') || lowerContent.includes('charts') || lowerContent.includes('trends')) {
          reportType = 'Analytics Metrics Dashboard';
          suggestedAction = 'DOWNLOAD_ANALYTICS_PDF';
        }

        queryResult = {
          intent: 'Report Generation',
          results: [{
            reportType,
            suggestedAction,
            timestamp: new Date()
          }],
          count: 1,
          executionTime: 0
        };
      }
    } catch (dbError) {
      logger.error(`Database operations failed during Chat query flow: ${dbError.message}`);
      throw new AppError('An internal query error occurred while reading KSP records.', 500);
    }

    logger.info(`Query Result: Count ${queryResult.count} | ExecutionTime ${queryResult.executionTime}ms`);

    // 5. Construct and append user message to database
    const userMessage = {
      role: 'user',
      sender: 'user',
      content: cleanContent,
      timestamp: new Date(),
      metadata: {
        intent: classification.intent,
        confidence: classification.confidence,
        requiredService: classification.requiredService,
        filters
      }
    };
    
    await ChatRepository.appendMessage(session._id, userMessage);
    logger.info(`Message Sent: User ${userId} inside conversation ${session._id}`);

    // 6. Invoke Gemini AI Reasoning Engine to format / explain database structured results
    const aiResult = await GeminiService.generateResponse(
      session.messages,
      cleanContent,
      queryResult, // Pass structured JSON data context
      classification.intent
    );

    // 7. Construct and append structured AI response to database
    const assistantMessage = {
      role: 'model',
      sender: 'model',
      content: aiResult.answer,
      timestamp: new Date(),
      metadata: {
        intent: classification.intent,
        summary: aiResult.summary,
        supportingEvidence: aiResult.supportingEvidence,
        confidence: aiResult.confidence || 'High',
        suggestedFollowUpQuestions: aiResult.suggestedFollowUpQuestions,
        latency: aiResult.latency,
        tokens: aiResult.tokens
      }
    };

    const updatedSession = await ChatRepository.appendMessage(session._id, assistantMessage);
    logger.info(`AI Response Appended: Conversation ID ${session._id}`);

    return {
      conversation: updatedSession,
      userMessage,
      assistantMessage
    };
  }
}

export default new ChatService();
