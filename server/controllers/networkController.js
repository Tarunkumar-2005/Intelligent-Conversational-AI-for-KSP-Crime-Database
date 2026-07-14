import NetworkService from '../services/NetworkService.js';
import { sendResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const getFilters = (req) => {
  const { nodeType, relationshipType, district, crimeCategory, startDate, endDate } = req.query;
  const filters = {};
  if (nodeType) filters.nodeType = nodeType;
  if (relationshipType) filters.relationshipType = relationshipType;
  if (district) filters.district = district;
  if (crimeCategory) filters.crimeCategory = crimeCategory;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  return filters;
};

export const getCriminalNeighborhood = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filters = getFilters(req);
  const graph = await NetworkService.getCriminalNeighborhood(id, filters);
  if (!graph) {
    return next(new AppError('No criminal node matching that ID was found.', 404));
  }
  const insights = NetworkService.getNetworkInsights(graph);
  return sendResponse(res, 200, 'Criminal neighborhood graph compiled.', { graph, insights });
});

export const getFIRNeighborhood = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filters = getFilters(req);
  const graph = await NetworkService.getFIRNeighborhood(id, filters);
  if (!graph) {
    return next(new AppError('No FIR node matching that ID was found.', 404));
  }
  const insights = NetworkService.getNetworkInsights(graph);
  return sendResponse(res, 200, 'FIR neighborhood graph compiled.', { graph, insights });
});

export const getVehicleNeighborhood = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filters = getFilters(req);
  const graph = await NetworkService.getVehicleNeighborhood(id, filters);
  if (!graph) {
    return next(new AppError('No vehicle node matching that ID was found.', 404));
  }
  const insights = NetworkService.getNetworkInsights(graph);
  return sendResponse(res, 200, 'Vehicle neighborhood graph compiled.', { graph, insights });
});

export const getPhoneNeighborhood = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filters = getFilters(req);
  const graph = await NetworkService.getPhoneNeighborhood(id, filters);
  if (!graph) {
    return next(new AppError('No phone node matching that ID was found.', 404));
  }
  const insights = NetworkService.getNetworkInsights(graph);
  return sendResponse(res, 200, 'Phone number neighborhood graph compiled.', { graph, insights });
});

export const getBankNeighborhood = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filters = getFilters(req);
  const graph = await NetworkService.getBankNeighborhood(id, filters);
  if (!graph) {
    return next(new AppError('No bank node matching that ID was found.', 404));
  }
  const insights = NetworkService.getNetworkInsights(graph);
  return sendResponse(res, 200, 'Bank account neighborhood graph compiled.', { graph, insights });
});

export const getLocationNeighborhood = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filters = getFilters(req);
  const graph = await NetworkService.getLocationNeighborhood(id, filters);
  if (!graph) {
    return next(new AppError('No location node matching that ID was found.', 404));
  }
  const insights = NetworkService.getNetworkInsights(graph);
  return sendResponse(res, 200, 'Location neighborhood graph compiled.', { graph, insights });
});

export const searchEntities = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(new AppError('Search query parameter is required.', 400));
  }
  const nodes = await NetworkService.searchEntities(query);
  return sendResponse(res, 200, 'Graph search match results compiled.', nodes);
});
