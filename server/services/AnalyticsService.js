import AnalyticsRepository from '../repositories/AnalyticsRepository.js';
import logger from '../config/logger.js';

class AnalyticsService {
  async getOverview(filters) {
    logger.info(`AnalyticsService: Fetching overview metrics with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getOverview(filters);
  }

  async getCrimeTrends(filters) {
    logger.info(`AnalyticsService: Fetching crime trends over time with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getCrimeTrends(filters);
  }

  async getCrimeTypes(filters) {
    logger.info(`AnalyticsService: Fetching crime types breakdown with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getCrimeTypes(filters);
  }

  async getDistricts(filters) {
    logger.info(`AnalyticsService: Fetching district breakdown with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getDistricts(filters);
  }

  async getPoliceStations(filters) {
    logger.info(`AnalyticsService: Fetching police station ranking with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getPoliceStations(filters);
  }

  async getInvestigationStatus(filters) {
    logger.info(`AnalyticsService: Fetching case statuses breakdown with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getInvestigationStatus(filters);
  }

  async getMonthly(filters) {
    logger.info(`AnalyticsService: Fetching monthly statistics with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getMonthly(filters);
  }

  async getYearly(filters) {
    logger.info(`AnalyticsService: Fetching yearly statistics with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getYearly(filters);
  }

  async getRepeatOffenders() {
    logger.info('AnalyticsService: Fetching top repeat offenders list');
    return await AnalyticsRepository.getRepeatOffenders();
  }

  async getTopCrimeLocations(filters) {
    logger.info(`AnalyticsService: Fetching top crime location hotspots with filters: ${JSON.stringify(filters)}`);
    return await AnalyticsRepository.getTopCrimeLocations(filters);
  }
}

export default new AnalyticsService();
