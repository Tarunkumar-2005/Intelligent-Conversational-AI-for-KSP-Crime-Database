import PredictionService from '../services/PredictionService.js';
import { sendResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';

const getFilters = (req) => {
  const { district, crimeCategory } = req.query;
  const filters = {};
  if (district) filters.district = district;
  if (crimeCategory) filters.crimeCategory = crimeCategory;
  return filters;
};

export const getOverview = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await PredictionService.getOverview(filters);
  return sendResponse(res, 200, 'Forecast overview context compiled.', data);
});

export const getTrends = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await PredictionService.getTrends(filters);
  return sendResponse(res, 200, 'Temporal trend forecast compiled.', data);
});

export const getHotspots = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await PredictionService.getHotspots(filters);
  return sendResponse(res, 200, 'Projected hotspot locations compiled.', data);
});

export const getAlerts = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await PredictionService.getAlerts(filters);
  return sendResponse(res, 200, 'Early warning alerts compiled.', data);
});

export const getDistrictForecast = asyncHandler(async (req, res, next) => {
  const { name } = req.params;
  const overview = await PredictionService.getOverview({ district: name });
  const trends = await PredictionService.getTrends({ district: name });
  return sendResponse(res, 200, `Forecast compiled for district: ${name}`, { overview, trends });
});

export const getCrimeTypeForecast = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const overview = await PredictionService.getOverview({ crimeCategory: type });
  const trends = await PredictionService.getTrends({ crimeCategory: type });
  return sendResponse(res, 200, `Forecast compiled for category: ${type}`, { overview, trends });
});
