import express from 'express';
import { 
  getOverview,
  getCrimeTrends,
  getCrimeTypes,
  getDistricts,
  getPoliceStations,
  getInvestigationStatus,
  getMonthly,
  getYearly,
  getRepeatOffenders,
  getTopCrimeLocations
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce JWT Authentication across all analytical endpoints
router.use(authenticate);

router.get('/overview', getOverview);
router.get('/crime-trends', getCrimeTrends);
router.get('/crime-types', getCrimeTypes);
router.get('/districts', getDistricts);
router.get('/police-stations', getPoliceStations);
router.get('/investigation-status', getInvestigationStatus);
router.get('/monthly', getMonthly);
router.get('/yearly', getYearly);
router.get('/repeat-offenders', getRepeatOffenders);
router.get('/top-crime-locations', getTopCrimeLocations);

export default router;
