import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '@/utils/logger';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === 'your-gemini-api-key-here' ||
      process.env.GEMINI_API_KEY === 'your-actual-api-key-goes-here' ||
      process.env.GEMINI_API_KEY === 'your-new-gemini-api-key-here' ||
      process.env.GEMINI_API_KEY === 'PUT_YOUR_NEW_API_KEY_HERE') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI chat service is not configured. Please contact support.'
        }
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .slice(-8) // Keep last 8 messages for context
        .map((msg: ChatMessage) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
    }

    // Create system prompt for FlashGenius AI context
    const systemPrompt = `You are an AI assistant for FlashGenius AI, a flashcard learning platform. You help users with:
- Study techniques and learning strategies
- Questions about flashcards and spaced repetition
- General academic and educational support
- Platform features and usage tips
- Memory techniques and learning optimization

Keep responses helpful, concise, and educational. If users ask about topics unrelated to learning or education, politely redirect them to educational topics.

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ''}

Current user message: ${message}

Please provide a helpful, educational response:`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const aiResponse = response.text();

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    logger.info('Chat message processed successfully', {
      userId: req.user?.id,
      messageLength: message.length,
      responseLength: aiResponse.length
    });

    res.json({
      success: true,
      data: {
        message: aiResponse.trim(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Chat error:', error);

    // Handle specific Gemini API errors
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'AI service is temporarily unavailable. Please try again later.'
        }
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('rate')) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'AI service rate limit exceeded. Please try again in a few minutes.'
        }
      });
    }

    if (error.message?.includes('safety') || error.message?.includes('blocked')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONTENT_BLOCKED',
          message: 'Your message was blocked by content filters. Please rephrase your question.'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: 'Failed to process chat message. Please try again.'
      }
    });
  }
};