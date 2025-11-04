import { Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { DocumentModel } from '@/models/Document';
import { FlashcardDeck } from '@/models/FlashcardDeck';
import { Flashcard } from '@/models/Flashcard';
import { AuthRequest } from '@/middleware/auth';
import { generateFlashcards } from '@/services/geminiService';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only TXT and PDF files are allowed'));
    }
  },
});

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }
    
    const userId = req.user._id;

    // Extract text content
    let extractedText = '';
    
    if (mimetype === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    }

    if (!extractedText || extractedText.trim().length < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_CONTENT',
          message: 'Document must contain at least 100 characters of text'
        }
      });
    }

    // Create document record
    const document = new DocumentModel({
      userId,
      filename: `${Date.now()}_${originalname}`,
      originalName: originalname,
      fileSize: size,
      mimeType: mimetype,
      gcsPath: `documents/${userId}/${Date.now()}_${originalname}`,
      extractedText,
      processingStatus: 'completed'
    });

    await document.save();

    res.status(201).json({
      success: true,
      data: {
        document: {
          id: document._id,
          originalName: document.originalName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          processingStatus: document.processingStatus,
          createdAt: document.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload document'
      }
    });
  }
};

export const generateFlashcardsFromDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const { cardCount = 10 } = req.body; // Default to 10 cards
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }
    
    const userId = req.user._id;

    console.log(`Generating flashcards for document ${documentId} by user ${userId}`);

    // Find the document
    const document = await DocumentModel.findOne({ _id: documentId, userId });
    if (!document) {
      console.log('Document not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    if (!document.extractedText || document.extractedText.trim().length < 50) {
      console.log('Insufficient text content');
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TEXT_CONTENT',
          message: 'Document has insufficient text content for flashcard generation'
        }
      });
    }

    console.log(`Extracted text length: ${document.extractedText.length} characters`);

    // Generate flashcards using Gemini AI (with fallback)
    const generatedCards = await generateFlashcards(document.extractedText, cardCount);
    console.log(`Generated ${generatedCards.length} flashcards`);

    // Create flashcard deck
    const deck = new FlashcardDeck({
      userId,
      documentId: document._id,
      title: `Flashcards from ${document.originalName}`,
      description: `Auto-generated flashcards from ${document.originalName}`,
      totalCards: generatedCards.length
    });

    await deck.save();
    console.log(`Created deck with ID: ${deck._id}`);

    // Create individual flashcards
    const flashcards = generatedCards.map(card => ({
      deckId: deck._id,
      question: card.question,
      answer: card.answer,
      difficulty: 'medium' as const
    }));

    const savedFlashcards = await Flashcard.insertMany(flashcards);
    console.log(`Saved ${savedFlashcards.length} flashcards to database`);

    res.status(201).json({
      success: true,
      data: {
        deck: {
          id: deck._id,
          title: deck.title,
          description: deck.description,
          totalCards: deck.totalCards,
          createdAt: deck.createdAt
        },
        flashcards: flashcards.map((card) => ({
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty
        }))
      }
    });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to generate flashcards';
    let errorCode = 'GENERATION_FAILED';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
        errorCode = 'AI_CONFIG_ERROR';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error connecting to AI service';
        errorCode = 'NETWORK_ERROR';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'AI response parsing error';
        errorCode = 'PARSING_ERROR';
      }
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }
    });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }
    
    const userId = req.user._id;
    
    const documents = await DocumentModel.find({ userId })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc._id,
          originalName: doc.originalName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          processingStatus: doc.processingStatus,
          createdAt: doc.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch documents'
      }
    });
  }
};