import FIR from '../models/FIR.js';
import Criminal from '../models/Criminal.js';
import Victim from '../models/Victim.js';
import Evidence from '../models/Evidence.js';
import CrimeCategory from '../models/CrimeCategory.js';
import logger from '../config/logger.js';

class SummaryService {
  /**
   * Compiles executive dashboard statistics across all core collections
   */
  async generateSummary() {
    const startTime = Date.now();
    logger.info('SummaryService: Generating system-wide database audit summary');

    // 1. Gather global counts
    const firsCount = await FIR.countDocuments();
    const criminalsCount = await Criminal.countDocuments();
    const victimsCount = await Victim.countDocuments();
    const evidenceCount = await Evidence.countDocuments();

    // 2. Aggregate status counts
    const statusAgg = await FIR.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusBreakdown = statusAgg.map(item => ({
      status: item._id,
      count: item.count
    }));

    // 3. Aggregate category counts and populate category titles
    const categoryAgg = await FIR.aggregate([
      { $group: { _id: '$crimeCategory', count: { $sum: 1 } } }
    ]);
    const categoryIds = categoryAgg.map(item => item._id).filter(id => id);
    
    const categories = await CrimeCategory.find({ _id: { $in: categoryIds } });
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    const categoryBreakdown = categoryAgg.map(item => ({
      category: item._id ? (categoryMap[item._id.toString()] || 'Other') : 'Other',
      count: item.count
    }));

    const executionTime = Date.now() - startTime;
    logger.info(`SummaryService: Aggregations completed in ${executionTime}ms`);

    return {
      intent: 'Case Summary',
      results: [{
        globalCounts: {
          totalFIRs: firsCount,
          totalCriminals: criminalsCount,
          totalVictims: victimsCount,
          totalEvidence: evidenceCount
        },
        statusBreakdown,
        categoryBreakdown
      }],
      count: 1,
      executionTime
    };
  }
}

export default new SummaryService();
