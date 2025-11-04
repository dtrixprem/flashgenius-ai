import { Response } from 'express';
import { FlashcardDeck } from '@/models/FlashcardDeck';
import { Flashcard } from '@/models/Flashcard';
import { StudySession } from '@/models/StudySession';
import { User } from '@/models/User';
import { AuthRequest } from '@/middleware/auth';

export const getDecks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    
    const decks = await FlashcardDeck.find({ userId })
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        decks: decks.map(deck => ({
          id: deck._id,
          title: deck.title,
          description: deck.description,
          totalCards: deck.totalCards,
          documentName: (deck.documentId as any)?.originalName,
          createdAt: deck.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch flashcard decks'
      }
    });
  }
};

export const getDeckCards = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;
    const userId = req.user._id;

    // Verify deck ownership
    const deck = await FlashcardDeck.findOne({ _id: deckId, userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DECK_NOT_FOUND',
          message: 'Flashcard deck not found'
        }
      });
    }

    const cards = await Flashcard.find({ deckId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        deck: {
          id: deck._id,
          title: deck.title,
          description: deck.description,
          totalCards: deck.totalCards
        },
        cards: cards.map(card => ({
          id: card._id,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty,
          timesReviewed: card.timesReviewed,
          correctAnswers: card.correctAnswers,
          lastReviewedAt: card.lastReviewedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get deck cards error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch flashcards'
      }
    });
  }
};

export const startStudySession = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;
    const userId = req.user._id;

    // Verify deck ownership
    const deck = await FlashcardDeck.findOne({ _id: deckId, userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DECK_NOT_FOUND',
          message: 'Flashcard deck not found'
        }
      });
    }

    // Create study session
    const session = new StudySession({
      userId,
      deckId,
      sessionType: 'review'
    });

    await session.save();

    // Get cards for the session (prioritize difficult cards)
    const cards = await Flashcard.find({ deckId })
      .sort({ 
        lastReviewedAt: 1, // Cards not reviewed recently first
        difficulty: -1,    // Harder cards first
        timesReviewed: 1   // Less reviewed cards first
      });

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          deckId: session.deckId,
          startedAt: session.startedAt
        },
        cards: cards.map(card => ({
          id: card._id,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty
        }))
      }
    });
  } catch (error) {
    console.error('Start study session error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_START_FAILED',
        message: 'Failed to start study session'
      }
    });
  }
};

export const completeStudySession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { cardsReviewed, correctAnswers, cardResults } = req.body;
    const userId = req.user._id;

    // Find and update session
    const session = await StudySession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Study session not found'
        }
      });
    }

    // Calculate points (base points + accuracy bonus)
    const accuracy = cardsReviewed > 0 ? correctAnswers / cardsReviewed : 0;
    const basePoints = cardsReviewed * 10;
    const accuracyBonus = Math.floor(accuracy * 50);
    const pointsEarned = basePoints + accuracyBonus;

    // Update session
    session.completedAt = new Date();
    session.cardsReviewed = cardsReviewed;
    session.correctAnswers = correctAnswers;
    session.pointsEarned = pointsEarned;
    await session.save();

    // Update user points
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: pointsEarned }
    });

    // Update individual card statistics
    if (cardResults && Array.isArray(cardResults)) {
      for (const result of cardResults) {
        await Flashcard.findByIdAndUpdate(result.cardId, {
          $inc: { 
            timesReviewed: 1,
            correctAnswers: result.correct ? 1 : 0
          },
          lastReviewedAt: new Date()
        });
      }
    }

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          cardsReviewed: session.cardsReviewed,
          correctAnswers: session.correctAnswers,
          pointsEarned: session.pointsEarned,
          accuracy: accuracy,
          completedAt: session.completedAt
        }
      }
    });
  } catch (error) {
    console.error('Complete study session error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_COMPLETE_FAILED',
        message: 'Failed to complete study session'
      }
    });
  }
};

export const updateFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { question, answer } = req.body;
    const userId = req.user._id;

    // Find the card and verify ownership through deck
    const card = await Flashcard.findById(cardId).populate({
      path: 'deckId',
      match: { userId }
    });

    if (!card || !card.deckId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: 'Flashcard not found'
        }
      });
    }

    // Update the card
    card.question = question || card.question;
    card.answer = answer || card.answer;
    await card.save();

    res.json({
      success: true,
      data: {
        card: {
          id: card._id,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty,
          updatedAt: card.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update flashcard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update flashcard'
      }
    });
  }
};