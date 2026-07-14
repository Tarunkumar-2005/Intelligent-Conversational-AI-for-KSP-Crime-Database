import MapService from '../services/MapService.js';
import { sendResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const getFilters = (req) => {
  const { startDate, endDate, district, policeStation, crimeCategory, crimeStatus, year, month } = req.query;
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (district) filters.district = district;
  if (policeStation) filters.policeStation = policeStation;
  if (crimeCategory) filters.crimeCategory = crimeCategory;
  if (crimeStatus) filters.crimeStatus = crimeStatus;
  if (year) filters.year = year;
  if (month) filters.month = month;
  return filters;
};

export const getOverview = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await MapService.getOverview(filters);
  return sendResponse(res, 200, 'Geospatial overview retrieved.', data);
});

export const getHotspots = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await MapService.getHotspots(filters);
  return sendResponse(res, 200, 'Crime hotspots overlay compiled.', data);
});

export const getClusters = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await MapService.getClusters(filters);
  return sendResponse(res, 200, 'Crime coordinates clusters compiled.', data);
});

export const getMarkers = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await MapService.getMarkers(filters);
  return sendResponse(res, 200, 'FIR markers compiled.', data);
});

export const getDistrictDetails = asyncHandler(async (req, res, next) => {
  const { name } = req.params;
  const overview = await MapService.getOverview({ district: name });
  const hotspots = await MapService.getHotspots({ district: name });
  return sendResponse(res, 200, `District overview for ${name} compiled.`, { overview, hotspots });
});

export const getLocationDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = await MapService.getLocationDetails(id);
  if (!data) {
    return next(new AppError('Crime location record not found.', 404));
  }
  return sendResponse(res, 200, 'Location details retrieved.', data);
});

export const searchLocations = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(new AppError('Query string parameter is required.', 400));
  }
  const data = await MapService.searchLocations(query);
  return sendResponse(res, 200, 'Locations search matched.', data);
});
