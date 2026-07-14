import FIRRepository from '../repositories/FIRRepository.js';
import logger from '../config/logger.js';

class FIRService {
  /**
   * Searches and filters FIR logs
   */
  async searchFIRs(filters) {
    const startTime = Date.now();
    logger.info(`FIRService: Querying with filters: ${JSON.stringify(filters)}`);

    const results = await FIRRepository.findByFilters(filters);
    const executionTime = Date.now() - startTime;

    logger.info(`FIRService: Retrieved ${results.length} records in ${executionTime}ms (Repository: FIRRepository)`);
    
    return {
      intent: 'Crime Search',
      results,
      count: results.length,
      executionTime
    };
  }

  /**
   * Retrieves detail sheet for a specific FIR number
   */
  async getFIRDetails(firNumber) {
    const startTime = Date.now();
    logger.info(`FIRService: Searching for FIR number ${firNumber}`);

    const result = await FIRRepository.findByFirNumber(firNumber);
    const executionTime = Date.now() - startTime;

    logger.info(`FIRService: Single lookup complete in ${executionTime}ms (Result: ${result ? 'Found' : 'Not Found'})`);

    return {
      intent: 'Crime Search',
      results: result ? [result] : [],
      count: result ? 1 : 0,
      executionTime
    };
  }

  /**
   * Retrieves FIR files currently marked under investigation
   */
  async getInvestigationStatus() {
    return await this.searchFIRs({ status: 'Under Investigation' });
  }
}

export default new FIRService();
