import VictimRepository from '../repositories/VictimRepository.js';
import logger from '../config/logger.js';

class VictimService {
  /**
   * Searches and filters victim records
   */
  async searchVictims(filters) {
    const startTime = Date.now();
    logger.info(`VictimService: Searching victim rosters: ${JSON.stringify(filters)}`);

    let results = [];
    if (filters.name) {
      results = await VictimRepository.findByName(filters.name);
    }

    const executionTime = Date.now() - startTime;
    logger.info(`VictimService: Found ${results.length} records in ${executionTime}ms (Repository: VictimRepository)`);

    return {
      intent: 'Victim Search',
      results,
      count: results.length,
      executionTime
    };
  }
}

export default new VictimService();
