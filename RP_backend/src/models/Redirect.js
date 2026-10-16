import mongoose from 'mongoose';

const redirectSchema = new mongoose.Schema(
  {
    sourcePath: { type: String, required: true, unique: true, trim: true },
    targetPath: { type: String, required: true, trim: true },
    statusCode: { type: Number, enum: [301, 302], default: 301 },
    isActive: { type: Boolean, default: true },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Redirect = mongoose.model('Redirect', redirectSchema);
