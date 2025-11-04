import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementType: string;
  achievementName: string;
  description: string;
  unlockedAt: Date;
  pointsAwarded: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  achievementType: {
    type: String,
    required: true,
  },
  achievementName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
UserAchievementSchema.index({ userId: 1 });
UserAchievementSchema.index({ achievementType: 1 });
UserAchievementSchema.index({ unlockedAt: -1 });

export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);