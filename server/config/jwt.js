import jwt from 'jsonwebtoken';
import logger from './logger.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET environment variable is missing.');
    throw new Error('JWT configuration error');
  }
  return secret;
};

export const signToken = (payload) => {
  try {
    const secret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    logger.error(`Error signing JWT: ${error.message}`);
    throw error;
  }
};

export const verifyToken = (token) => {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    logger.debug(`JWT verification failed: ${error.message}`);
    return null;
  }
};
