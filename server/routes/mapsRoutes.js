import express from 'express';
import { 
  getOverview,
  getHotspots,
  getClusters,
  getMarkers,
  getDistrictDetails,
  getLocationDetails,
  searchLocations
} from '../controllers/mapController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce JWT Auth across all maps spatial endpoints
router.use(authenticate);

router.get('/overview', getOverview);
router.get('/hotspots', getHotspots);
router.get('/clusters', getClusters);
router.get('/markers', getMarkers);
router.get('/district/:name', getDistrictDetails);
router.get('/location/:id', getLocationDetails);
router.get('/search', searchLocations);

export default router;
