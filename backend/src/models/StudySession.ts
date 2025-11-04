import mongoose, { Document, Schema } from 'mongoose';

export interface IStudySession extends Document {
  userId: mongoose.Types.ObjectId;
  deckId: mongoose.Types.ObjectId;
  startedAt: Date;
  completedAt?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  pointsEarned: number;
  sessionType: 'review' | 'practice' | 'test';
  createdAt: Date;
  updatedAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deckId: {
    type: Schema.Types.ObjectId,
    ref: 'FlashcardDeck',
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  cardsReviewed: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  sessionType: {
    type: String,
    enum: ['review', 'practice', 'test'],
    default: 'review',
  },
}, {
  timestamps: true,
});

// Indexes
StudySessionSchema.index({ userId: 1 });
StudySessionSchema.index({ deckId: 1 });
StudySessionSchema.index({ startedAt: -1 });
StudySessionSchema.index({ completedAt: 1 });

export const StudySession = mongoose.model<IStudySession>('StudySession', StudySessionSchema);