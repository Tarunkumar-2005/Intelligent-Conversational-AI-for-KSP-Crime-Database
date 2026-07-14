import CriminalRepository from '../repositories/CriminalRepository.js';
import logger from '../config/logger.js';

class CriminalService {
  /**
   * Performs query operations on Criminal profiles
   */
  async searchCriminals(filters) {
    const startTime = Date.now();
    logger.info(`CriminalService: Querying suspect records: ${JSON.stringify(filters)}`);

    let results = [];
    if (filters.name) {
      results = await CriminalRepository.findByName(filters.name);
    } else {
      // Default to repeat offenders lookup if name is not parsed
      results = await CriminalRepository.findRepeatOffenders();
    }

    const executionTime = Date.now() - startTime;
    logger.info(`CriminalService: Found ${results.length} suspects in ${executionTime}ms (Repository: CriminalRepository)`);

    return {
      intent: 'Criminal Search',
      results,
      count: results.length,
      executionTime
    };
  }

  /**
   * Retrieves list of repeat offenders
   */
  async getRepeatOffenders() {
    const startTime = Date.now();
    const results = await CriminalRepository.findRepeatOffenders();
    const executionTime = Date.now() - startTime;

    return {
      intent: 'Criminal Search',
      results,
      count: results.length,
      executionTime
    };
  }
}

export default new CriminalService();
