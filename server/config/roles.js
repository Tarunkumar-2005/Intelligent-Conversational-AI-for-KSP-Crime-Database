export const ROLES = {
  INVESTIGATOR: 'Investigator',
  ANALYST: 'Analyst',
  SUPERVISOR: 'Supervisor',
  POLICYMAKER: 'Policymaker',
};

// Map of actions to roles that are authorized to perform them
export const PERMISSIONS = {
  // Case Access
  VIEW_CASE: [ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.SUPERVISOR],
  CREATE_CASE: [ROLES.INVESTIGATOR, ROLES.SUPERVISOR],
  UPDATE_CASE: [ROLES.INVESTIGATOR, ROLES.SUPERVISOR],
  DELETE_CASE: [ROLES.SUPERVISOR], // Soft delete only

  // Analytics Dashboard
  VIEW_ANALYTICS: [ROLES.ANALYST, ROLES.SUPERVISOR, ROLES.POLICYMAKER],
  
  // Network Graph & Map Hotspots
  VIEW_NETWORK: [ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.SUPERVISOR],
  VIEW_HOTSPOTS: [ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.SUPERVISOR, ROLES.POLICYMAKER],

  // Offender Profiling & AI
  VIEW_OFFENDERS: [ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.SUPERVISOR],
  TRIGGER_PREDICTION: [ROLES.ANALYST, ROLES.SUPERVISOR],
  EXPORT_REPORT: [ROLES.INVESTIGATOR, ROLES.SUPERVISOR],

  // System Administration
  VIEW_AUDIT_LOGS: [ROLES.SUPERVISOR],
};

/**
 * Helper to check if a user role is permitted to perform an action.
 * @param {string} userRole 
 * @param {string} action 
 * @returns {boolean}
 */
export const hasPermission = (userRole, action) => {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};
