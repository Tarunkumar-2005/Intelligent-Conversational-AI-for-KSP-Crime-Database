import ProfileService from '../services/ProfileService.js';
import { sendResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const getOffenderProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = await ProfileService.getOffenderProfile(id);
  if (!data) {
    return next(new AppError('Criminal profile record not found.', 404));
  }
  return sendResponse(res, 200, 'Criminal profile dossier retrieved.', data);
});

export const getRepeatOffenders = asyncHandler(async (req, res, next) => {
  const data = await ProfileService.getRepeatOffenders();
  return sendResponse(res, 200, 'Repeat offenders list compiled.', data);
});

export const getRiskRanking = asyncHandler(async (req, res, next) => {
  const data = await ProfileService.getRiskRanking();
  return sendResponse(res, 200, 'Threat risk ranking compiled.', data);
});

export const getModusOperandi = asyncHandler(async (req, res, next) => {
  const data = await ProfileService.getModusOperandiSummary();
  return sendResponse(res, 200, 'Modus operandi summaries compiled.', data);
});

export const getBehaviorAnalysis = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = await ProfileService.getBehaviorAnalysis(id);
  if (!data) {
    return next(new AppError('Criminal behaviour record not found.', 404));
  }
  return sendResponse(res, 200, 'Behavioral profiling dossier retrieved.', data);
});

export const getSimilarCases = asyncHandler(async (req, res, next) => {
  const { firId } = req.params;
  const data = await ProfileService.getSimilarCases(firId);
  return sendResponse(res, 200, 'Similar historical cases matched.', data);
});

export const getInvestigationSummary = asyncHandler(async (req, res, next) => {
  const { firId } = req.params;
  const summary = await ProfileService.getInvestigationSummary(firId);
  if (!summary) {
    return next(new AppError('Case record not found.', 404));
  }
  const timeline = await ProfileService.getInvestigationTimeline(firId);
  return sendResponse(res, 200, 'Investigation summary and timeline compiled.', { summary, timeline });
});

export const getInvestigationRecommendations = asyncHandler(async (req, res, next) => {
  const { firId } = req.params;
  const data = await ProfileService.getInvestigationRecommendations(firId);
  if (!data) {
    return next(new AppError('Case record not found.', 404));
  }
  return sendResponse(res, 200, 'Investigation recommendations compiled.', data);
});
