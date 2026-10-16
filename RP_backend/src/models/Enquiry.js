import mongoose from 'mongoose';

const internalNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  addedBy: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    productOfInterest: {
      type: String,
      trim: true,
      default: 'Supermarket Racks',
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },
    storeArea: {
      type: String,
      default: '',
    },
    timeline: {
      type: String,
      default: '',
    },
    requirementDetails: {
      type: String,
      default: '',
    },
    sourcePageUrl: {
      type: String,
      default: '/',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quotation_sent', 'follow_up', 'won', 'lost'],
      default: 'new',
      index: true,
    },
    internalNotes: [internalNoteSchema],
    assignedTo: {
      type: String,
      default: 'Unassigned',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
