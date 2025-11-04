import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashcard extends Document {
  deckId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timesReviewed: number;
  correctAnswers: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>({
  deckId: {
    type: Schema.Types.ObjectId,
    ref: 'FlashcardDeck',
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  timesReviewed: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  lastReviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
FlashcardSchema.index({ deckId: 1 });
FlashcardSchema.index({ difficulty: 1 });
FlashcardSchema.index({ lastReviewedAt: 1 });

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);