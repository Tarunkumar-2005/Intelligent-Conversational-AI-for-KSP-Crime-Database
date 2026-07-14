import ChatService from '../services/ChatService.js';
import { sendResponse } from '../utils/responseHandler.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Validates if the given string is a valid MongoDB ObjectId
 */
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid conversation ID format.', 400);
  }
};

/**
 * Handler: Initializes a fresh chat conversation thread
 */
export const createConversation = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const conversation = await ChatService.createConversation(req.user._id, title);
  return sendResponse(res, 201, 'Conversation thread created successfully.', { conversation });
});

/**
 * Handler: Lists active conversation threads belonging to user
 */
export const getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await ChatService.getConversations(req.user._id);
  return sendResponse(res, 200, 'Conversations list retrieved.', { conversations });
});

/**
 * Handler: Fetches messages history list of a specific thread
 */
export const getConversationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateObjectId(id);

  const conversation = await ChatService.getConversationById(id, req.user._id);
  return sendResponse(res, 200, 'Conversation dossier retrieved.', { conversation });
});

/**
 * Handler: Renames/updates thread title description
 */
export const updateConversation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;
  validateObjectId(id);

  if (!title || !title.trim()) {
    return next(new AppError('Please provide a valid conversation title.', 400));
  }

  const conversation = await ChatService.updateConversation(id, req.user._id, title.trim());
  return sendResponse(res, 200, 'Conversation renamed successfully.', { conversation });
});

/**
 * Handler: Triggers soft deletion of a conversation
 */
export const deleteConversation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateObjectId(id);

  await ChatService.deleteConversation(id, req.user._id);
  return sendResponse(res, 200, 'Conversation soft-deleted successfully.');
});

/**
 * Handler: Posts user message and returns classification and model reply
 */
export const postMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { message, content } = req.body;
  validateObjectId(id);

  const text = message || content;
  if (!text || !text.trim()) {
    return next(new AppError('Please provide a non-empty message.', 400));
  }

  const result = await ChatService.sendMessage(id, req.user._id, text.trim());
  return sendResponse(res, 200, 'Message appended and processed.', {
    userMessage: result.userMessage,
    assistantMessage: result.assistantMessage,
    conversation: result.conversation
  });
});
