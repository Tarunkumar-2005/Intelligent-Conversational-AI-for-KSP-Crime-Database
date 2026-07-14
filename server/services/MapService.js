import MapRepository from '../repositories/MapRepository.js';
import logger from '../config/logger.js';

class MapService {
  async getOverview(filters) {
    logger.info(`MapService: Gathering geospatial overview matching: ${JSON.stringify(filters)}`);
    return await MapRepository.getOverview(filters);
  }

  async getHotspots(filters) {
    logger.info(`MapService: Ingesting hotspot threat areas matching: ${JSON.stringify(filters)}`);
    return await MapRepository.getHotspots(filters);
  }

  async getClusters(filters) {
    logger.info(`MapService: Drawing clustered coordinates matching: ${JSON.stringify(filters)}`);
    return await MapRepository.getClusters(filters);
  }

  async getMarkers(filters) {
    logger.info(`MapService: Querying marker overlays matching: ${JSON.stringify(filters)}`);
    return await MapRepository.getMarkers(filters);
  }

  async getLocationDetails(id) {
    logger.info(`MapService: Inspecting single location dossier for ID ${id}`);
    return await MapRepository.getLocationDetails(id);
  }

  async searchLocations(query) {
    logger.info(`MapService: Running spatial search for: "${query}"`);
    return await MapRepository.searchLocations(query);
  }
}

export default new MapService();
