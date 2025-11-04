import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  
  next();
};

export const validateChatMessage = (req: Request, res: Response, next: NextFunction) => {
  const { message, conversationHistory } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_MESSAGE',
        message: 'Message is required and must be a non-empty string'
      }
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MESSAGE_TOO_LONG',
        message: 'Message must be less than 2000 characters'
      }
    });
  }

  if (conversationHistory && !Array.isArray(conversationHistory)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CONVERSATION_HISTORY',
        message: 'Conversation history must be an array'
      }
    });
  }

  next();
};