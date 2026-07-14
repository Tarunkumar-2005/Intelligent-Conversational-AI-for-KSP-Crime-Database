import EvidenceRepository from '../repositories/EvidenceRepository.js';
import FIRRepository from '../repositories/FIRRepository.js';
import logger from '../config/logger.js';

class EvidenceService {
  /**
   * Searches and retrieves evidence logs linked to a case file
   */
  async searchEvidence(filters) {
    const startTime = Date.now();
    logger.info(`EvidenceService: Querying evidence logs: ${JSON.stringify(filters)}`);

    let results = [];
    if (filters.evidenceId) {
      const match = await EvidenceRepository.findByEvidenceId(filters.evidenceId);
      if (match) results = [match];
    } else if (filters.firNumber) {
      const fir = await FIRRepository.findByFirNumber(filters.firNumber);
      if (fir) {
        results = await EvidenceRepository.findByFirId(fir._id);
      }
    }

    const executionTime = Date.now() - startTime;
    logger.info(`EvidenceService: Retrieved ${results.length} evidence pieces in ${executionTime}ms (Repository: EvidenceRepository)`);

    return {
      intent: 'Evidence Search',
      results,
      count: results.length,
      executionTime
    };
  }
}

export default new EvidenceService();
