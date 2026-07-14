import express from 'express';
import { 
  getOverview,
  getTrends,
  getHotspots,
  getAlerts,
  getDistrictForecast,
  getCrimeTypeForecast
} from '../controllers/predictionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication & restrict roles to Analyst or Supervisor
router.use(authenticate);
router.use(authorize('Analyst', 'Supervisor'));

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/hotspots', getHotspots);
router.get('/alerts', getAlerts);
router.get('/district/:name', getDistrictForecast);
router.get('/crime-type/:type', getCrimeTypeForecast);

export default router;
