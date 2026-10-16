import mongoose from 'mongoose';

const productCityMappingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City reference is required'],
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    availabilityNotes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring a product can only be mapped to a city once
productCityMappingSchema.index({ product: 1, city: 1 }, { unique: true });
productCityMappingSchema.index({ city: 1, isAvailable: 1 });
productCityMappingSchema.index({ product: 1, isAvailable: 1 });

export const ProductCityMapping = mongoose.model('ProductCityMapping', productCityMappingSchema);
