import NetworkRepository from '../repositories/NetworkRepository.js';
import logger from '../config/logger.js';

class NetworkService {
  /**
   * Applies filters like nodeType, relationshipType, district, and dateRange to a graph object.
   */
  applyFilters(graph, filters = {}) {
    if (!graph || !graph.nodes) return { nodes: [], edges: [] };

    let filteredNodes = [...graph.nodes];
    let filteredEdges = [...graph.edges];

    // 1. Filter by Node Type
    if (filters.nodeType) {
      const allowed = Array.isArray(filters.nodeType) ? filters.nodeType : [filters.nodeType];
      filteredNodes = filteredNodes.filter(n => allowed.includes(n.type));
    }

    // 2. Filter by Relationship Type
    if (filters.relationshipType) {
      const allowed = Array.isArray(filters.relationshipType) ? filters.relationshipType : [filters.relationshipType];
      filteredEdges = filteredEdges.filter(e => allowed.includes(e.relationshipType));
    }

    // 3. Filter FIR nodes by district, category, and date bounds
    filteredNodes = filteredNodes.filter(node => {
      if (node.type === 'FIR' && node.metadata) {
        if (filters.district && node.metadata.district && node.metadata.district !== filters.district) {
          return false;
        }
        if (filters.crimeCategory && node.metadata.crimeCategory && node.metadata.crimeCategory !== filters.crimeCategory) {
          return false;
        }
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          const dt = new Date(node.metadata.incidentDateTime || node.metadata.reportedDateTime);
          if (dt < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          const dt = new Date(node.metadata.incidentDateTime || node.metadata.reportedDateTime);
          if (dt > end) return false;
        }
      }
      return true;
    });

    // 4. Cascade delete: remove edges that reference deleted nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = filteredEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return { nodes: filteredNodes, edges: filteredEdges };
  }

  /**
   * Identifies insights from the compiled graph network
   */
  getNetworkInsights(graph) {
    if (!graph || !graph.nodes) return {};

    const suspects = graph.nodes.filter(n => n.type === 'Criminal');
    const phones = graph.nodes.filter(n => n.type === 'PhoneNumber');
    const banks = graph.nodes.filter(n => n.type === 'BankAccount');
    const vehicles = graph.nodes.filter(n => n.type === 'Vehicle');

    const insights = {
      repeatOffenders: suspects.filter(s => s.metadata?.casesCount > 1 || s.metadata?.status === 'Active Convict').map(s => s.label),
      sharedPhones: [],
      sharedBanks: [],
      sharedVehicles: [],
      highlyConnectedSuspects: []
    };

    // Calculate degree centrality (highly connected suspects)
    const nodeDegrees = {};
    graph.edges.forEach(e => {
      nodeDegrees[e.source] = (nodeDegrees[e.source] || 0) + 1;
      nodeDegrees[e.target] = (nodeDegrees[e.target] || 0) + 1;
    });

    suspects.forEach(s => {
      const degree = nodeDegrees[s.id] || 0;
      if (degree >= 3) {
        insights.highlyConnectedSuspects.push({ name: s.label, linksCount: degree });
      }
    });

    // Detect shared assets: assets connected to multiple suspects
    const assetToSuspects = {};
    graph.edges.forEach(e => {
      if (e.source.startsWith('criminal-') && (e.target.startsWith('phone-') || e.target.startsWith('bank-') || e.target.startsWith('vehicle-'))) {
        assetToSuspects[e.target] = assetToSuspects[e.target] || [];
        assetToSuspects[e.target].push(e.source);
      }
    });

    Object.keys(assetToSuspects).forEach(assetId => {
      const linkedSuspects = assetToSuspects[assetId];
      if (linkedSuspects.length > 1) {
        const node = graph.nodes.find(n => n.id === assetId);
        const names = linkedSuspects.map(sid => graph.nodes.find(n => n.id === sid)?.label).filter(Boolean);
        if (node) {
          if (node.type === 'PhoneNumber') insights.sharedPhones.push({ phone: node.label, suspects: names });
          if (node.type === 'BankAccount') insights.sharedBanks.push({ account: node.label, suspects: names });
          if (node.type === 'Vehicle') insights.sharedVehicles.push({ vehicle: node.label, suspects: names });
        }
      }
    });

    return insights;
  }

  async getCriminalNeighborhood(id, filters = {}) {
    logger.info(`NetworkService: Compiling criminal network neighborhood for Criminal ID ${id}`);
    const graph = await NetworkRepository.getCriminalNeighborhood(id);
    return this.applyFilters(graph, filters);
  }

  async getFIRNeighborhood(id, filters = {}) {
    logger.info(`NetworkService: Compiling FIR network neighborhood for FIR ID ${id}`);
    const graph = await NetworkRepository.getFIRNeighborhood(id);
    return this.applyFilters(graph, filters);
  }

  async getVehicleNeighborhood(id, filters = {}) {
    logger.info(`NetworkService: Compiling vehicle network neighborhood for Vehicle ID ${id}`);
    const graph = await NetworkRepository.getVehicleNeighborhood(id);
    return this.applyFilters(graph, filters);
  }

  async getPhoneNeighborhood(id, filters = {}) {
    logger.info(`NetworkService: Compiling phone network neighborhood for Phone ID ${id}`);
    const graph = await NetworkRepository.getPhoneNeighborhood(id);
    return this.applyFilters(graph, filters);
  }

  async getBankNeighborhood(id, filters = {}) {
    logger.info(`NetworkService: Compiling bank network neighborhood for Bank Account ID ${id}`);
    const graph = await NetworkRepository.getBankNeighborhood(id);
    return this.applyFilters(graph, filters);
  }

  async getLocationNeighborhood(id, filters = {}) {
    logger.info(`NetworkService: Compiling location network neighborhood for Location ID ${id}`);
    const graph = await NetworkRepository.getLocationNeighborhood(id);
    return this.applyFilters(graph, filters);
  }

  async searchEntities(query) {
    logger.info(`NetworkService: Searching initial graph nodes for pattern: "${query}"`);
    return await NetworkRepository.searchEntities(query);
  }
}

export default new NetworkService();
