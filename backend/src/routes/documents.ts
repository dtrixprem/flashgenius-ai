import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { 
  uploadDocument, 
  generateFlashcardsFromDocument, 
  getDocuments,
  upload 
} from '@/controllers/documentController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getDocuments);
router.post('/upload', upload.single('document'), uploadDocument);
router.post('/:documentId/generate-flashcards', generateFlashcardsFromDocument);

export default router;