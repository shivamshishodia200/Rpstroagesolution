import mongoose from 'mongoose';

const pageRevisionSchema = new mongoose.Schema(
  {
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Page reference is required'],
      index: true,
    },
    pageType: {
      type: String,
      enum: ['CityProduct', 'CityHomepage', 'HomepageContent'],
      default: 'CityProduct',
      index: true,
    },
    version: {
      type: Number,
      required: [true, 'Version number is required'],
      index: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Snapshot content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    authorName: {
      type: String,
      default: 'System',
    },
    authorEmail: {
      type: String,
      default: '',
    },
    changeSummary: {
      type: String,
      default: 'Content update',
    },
    workflowAction: {
      type: String,
      enum: [
        'CREATE_DRAFT',
        'UPDATE_CONTENT',
        'SUBMIT_REVIEW',
        'APPROVE',
        'REQUEST_CHANGES',
        'PUBLISH',
        'UNPUBLISH',
        'RESTORE_VERSION',
      ],
      default: 'UPDATE_CONTENT',
    },
  },
  { timestamps: true }
);

pageRevisionSchema.index({ pageId: 1, version: -1 });

export const PageRevision = mongoose.model('PageRevision', pageRevisionSchema);
