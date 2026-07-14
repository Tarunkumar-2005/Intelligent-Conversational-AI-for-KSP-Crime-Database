import express from 'express';
import { 
  getCriminalNeighborhood,
  getFIRNeighborhood,
  getVehicleNeighborhood,
  getPhoneNeighborhood,
  getBankNeighborhood,
  getLocationNeighborhood,
  searchEntities
} from '../controllers/networkController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication across all network graph endpoints
router.use(authenticate);

router.get('/criminal/:id', getCriminalNeighborhood);
router.get('/fir/:id', getFIRNeighborhood);
router.get('/vehicle/:id', getVehicleNeighborhood);
router.get('/phone/:id', getPhoneNeighborhood);
router.get('/bank/:id', getBankNeighborhood);
router.get('/location/:id', getLocationNeighborhood);
router.get('/search', searchEntities);

export default router;
