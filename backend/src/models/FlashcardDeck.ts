import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashcardDeck extends Document {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  totalCards: number;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardDeckSchema = new Schema<IFlashcardDeck>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  totalCards: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
FlashcardDeckSchema.index({ userId: 1 });
FlashcardDeckSchema.index({ documentId: 1 });
FlashcardDeckSchema.index({ createdAt: -1 });

export const FlashcardDeck = mongoose.model<IFlashcardDeck>('FlashcardDeck', FlashcardDeckSchema);