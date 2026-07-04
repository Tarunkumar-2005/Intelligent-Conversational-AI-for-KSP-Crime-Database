import logger from './logger.js';

let catalystApp = null;

export const initCatalyst = async () => {
  // If we are running in Zoho Catalyst, we can load the catalyst SDK.
  // We use a dynamic import to avoid crashes during local MERN development if the SDK is not installed.
  if (process.env.CATALYST_PROJECT_KEY || process.env.CATALYST_PROJECT_ID) {
    try {
      const catalyst = await import('zcatalyst-sdk-node');
      catalystApp = catalyst.initialize();
      logger.info('Zoho Catalyst Node SDK initialized successfully.');
      return catalystApp;
    } catch (error) {
      logger.warn(`Zoho Catalyst environment detected, but SDK failed to load: ${error.message}`);
      return null;
    }
  } else {
    logger.debug('Running in standard local node environment. Zoho Catalyst features bypassed.');
    return null;
  }
};

export const getCatalystApp = () => catalystApp;
