const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'pdf', 'document', 'archive', 'other'],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    aiChatHistory: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ fileName: 'text', originalName: 'text' });

module.exports = mongoose.model('File', fileSchema);
