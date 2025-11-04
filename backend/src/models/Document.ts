import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  gcsPath: string;
  extractedText?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  gcsPath: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ processingStatus: 1 });
DocumentSchema.index({ createdAt: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);