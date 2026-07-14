import AnalyticsService from '../services/AnalyticsService.js';
import { sendResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Extracts and maps query parameters to filter objects
 */
const getFilters = (req) => {
  const { 
    startDate, 
    endDate, 
    district, 
    policeStation, 
    crimeCategory, 
    crimeStatus, 
    year, 
    month 
  } = req.query;

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
  const data = await AnalyticsService.getOverview(filters);
  return sendResponse(res, 200, 'Analytics overview metrics retrieved successfully.', data);
});

export const getCrimeTrends = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getCrimeTrends(filters);
  return sendResponse(res, 200, 'Crime trends over time retrieved.', data);
});

export const getCrimeTypes = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getCrimeTypes(filters);
  return sendResponse(res, 200, 'Crime categories breakdown retrieved.', data);
});

export const getDistricts = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getDistricts(filters);
  return sendResponse(res, 200, 'District-wise crime statistics retrieved.', data);
});

export const getPoliceStations = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getPoliceStations(filters);
  return sendResponse(res, 200, 'Police station performance index retrieved.', data);
});

export const getInvestigationStatus = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getInvestigationStatus(filters);
  return sendResponse(res, 200, 'Investigation status ratios retrieved.', data);
});

export const getMonthly = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getMonthly(filters);
  return sendResponse(res, 200, 'Monthly crime statistics retrieved.', data);
});

export const getYearly = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getYearly(filters);
  return sendResponse(res, 200, 'Yearly crime statistics retrieved.', data);
});

export const getRepeatOffenders = asyncHandler(async (req, res, next) => {
  const data = await AnalyticsService.getRepeatOffenders();
  return sendResponse(res, 200, 'Top repeat offenders dossier retrieved.', data);
});

export const getTopCrimeLocations = asyncHandler(async (req, res, next) => {
  const filters = getFilters(req);
  const data = await AnalyticsService.getTopCrimeLocations(filters);
  return sendResponse(res, 200, 'Location hotspots ranking retrieved.', data);
});
