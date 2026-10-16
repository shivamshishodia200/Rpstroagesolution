import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'System' },
    action: { type: String, required: true }, // e.g. "CREATE_CITY", "PUBLISH_SEO_PAGE"
    entityType: { type: String, required: true }, // "City", "Product", "CityProduct", "Homepage"
    entityId: { type: String, default: '' },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
