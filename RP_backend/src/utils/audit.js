import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({ req, action, entityType, entityId, details }) => {
  try {
    await AuditLog.create({
      userId: req?.user?._id,
      userName: req?.user?.name || 'System / Public',
      userRole: req?.user?.role || 'Guest',
      action,
      entityType,
      entityId: entityId ? String(entityId) : '',
      details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      ipAddress: req?.ip || req?.headers['x-forwarded-for'] || '',
    });
  } catch (err) {
    console.error('[Audit Log] Failed to record:', err.message);
  }
};
