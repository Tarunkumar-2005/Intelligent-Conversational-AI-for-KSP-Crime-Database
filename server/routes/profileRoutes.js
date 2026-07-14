import express from 'express';
import { 
  getOffenderProfile,
  getRepeatOffenders,
  getRiskRanking,
  getModusOperandi,
  getBehaviorAnalysis,
  getSimilarCases,
  getInvestigationSummary,
  getInvestigationRecommendations
} from '../controllers/profileController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce JWT Auth & restrict roles to Investigator, Analyst, or Supervisor
router.use(authenticate);
router.use(authorize('Investigator', 'Analyst', 'Supervisor'));

router.get('/offender/:id', getOffenderProfile);
router.get('/repeat-offenders', getRepeatOffenders);
router.get('/risk-ranking', getRiskRanking);
router.get('/modus-operandi', getModusOperandi);
router.get('/behavior/:id', getBehaviorAnalysis);
router.get('/similar-cases/:firId', getSimilarCases);
router.get('/investigation-summary/:firId', getInvestigationSummary);
router.get('/investigation-recommendations/:firId', getInvestigationRecommendations);

export default router;
