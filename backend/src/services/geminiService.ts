import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GeneratedFlashcard {
  question: string;
  answer: string;
}

// Fallback flashcards if AI generation fails
const generateFallbackFlashcards = (text: string, cardCount: number = 10): GeneratedFlashcard[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const flashcards: GeneratedFlashcard[] = [];

  // Create simple flashcards from the sentences
  const actualCardCount = Math.min(cardCount, Math.max(5, sentences.length));

  for (let i = 0; i < actualCardCount && i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 20) {
      // Create full questions without truncation
      const questionTypes = [
        `What does this text state about the following topic?`,
        `According to the document, what information is provided about "${sentence.split(' ').slice(0, 8).join(' ')}"?`,
        `Complete this statement from the document.`,
        `What key information is mentioned regarding "${sentence.split(' ').slice(0, 6).join(' ')}"?`
      ];

      // Use full sentence as answer, but limit to reasonable length
      const fullAnswer = sentence.length > 500 ? sentence.substring(0, 500) + '...' : sentence;
      
      flashcards.push({
        question: questionTypes[i % questionTypes.length],
        answer: fullAnswer
      });
    }
  }

  // Add some general questions if we have fewer cards
  if (flashcards.length < actualCardCount) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    
    paragraphs.slice(0, actualCardCount - flashcards.length).forEach((paragraph) => {
      if (flashcards.length < actualCardCount) {
        const trimmedParagraph = paragraph.trim();
        const words = trimmedParagraph.split(' ');
        const keyPhrase = words.slice(0, 8).join(' ');
        
        flashcards.push({
          question: `What does the document explain about "${keyPhrase}"?`,
          answer: trimmedParagraph.length > 500 ? trimmedParagraph.substring(0, 500) + '...' : trimmedParagraph
        });
      }
    });
  }

  return flashcards.length > 0 ? flashcards : [{
    question: "What is the main topic of this document?",
    answer: "This document contains information that can be studied using flashcards. The content covers various topics that can be learned through spaced repetition and active recall techniques."
  }];
};

export const generateFlashcards = async (text: string, cardCount: number = 10): Promise<GeneratedFlashcard[]> => {
  // Validate input
  if (!text || text.trim().length < 50) {
    throw new Error('Text content is too short to generate flashcards');
  }

  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'your-gemini-api-key-here' ||
    process.env.GEMINI_API_KEY === 'your-actual-api-key-goes-here' ||
    process.env.GEMINI_API_KEY === 'your-new-gemini-api-key-here') {
    console.warn('Gemini API key not configured, using fallback flashcards');
    return generateFallbackFlashcards(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Limit text length to avoid API limits
    const limitedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;

    const actualCardCount = Math.max(5, Math.min(20, cardCount)); // Ensure between 5-20 cards

    const prompt = `Create exactly ${actualCardCount} high-quality, complete flashcards from this text. 

IMPORTANT REQUIREMENTS:
- Each question must be complete and clear (minimum 10 words)
- Each answer must be comprehensive and complete (minimum 15 words)
- Do NOT truncate or cut off questions or answers
- Ensure all text is fully readable and makes sense
- Generate a good mix of question types: factual, conceptual, definition, and application questions

Text to analyze: ${limitedText}

Return ONLY a valid JSON array with complete, untruncated questions and answers:
[{"question":"Complete question here that is fully readable?","answer":"Complete answer here that provides full information and context."}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();

    console.log('Gemini API raw response:', generatedText);
    console.log('Generated text length:', generatedText.length);

    // Clean up the response
    generatedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    generatedText = generatedText.replace(/^[^[]*/, '').replace(/[^\]]*$/, '');

    if (!generatedText.startsWith('[')) {
      throw new Error('Invalid JSON format from Gemini API');
    }

    const flashcards = JSON.parse(generatedText);

    // Validate the response format
    if (!Array.isArray(flashcards)) {
      throw new Error('Response is not an array');
    }

    // Validate and clean each flashcard with stricter requirements
    const validFlashcards = flashcards
      .filter(card =>
        card &&
        typeof card === 'object' &&
        card.question &&
        card.answer &&
        typeof card.question === 'string' &&
        typeof card.answer === 'string' &&
        card.question.trim().length >= 10 && // Minimum 10 characters for questions
        card.answer.trim().length >= 15 && // Minimum 15 characters for answers
        !card.question.trim().endsWith('...') && // Ensure questions aren't truncated
        !card.answer.trim().endsWith('...') // Ensure answers aren't truncated
      )
      .map(card => ({
        question: card.question.trim(),
        answer: card.answer.trim()
      }))
      .slice(0, 20); // Limit to 20 cards max

    if (validFlashcards.length === 0) {
      console.warn('No valid flashcards from Gemini API, using fallback');
      return generateFallbackFlashcards(text, cardCount);
    }

    console.log(`Generated ${validFlashcards.length} flashcards successfully`);
    
    // Debug: Log first flashcard to check for truncation
    if (validFlashcards.length > 0) {
      console.log('Sample flashcard:');
      console.log('Question length:', validFlashcards[0].question.length);
      console.log('Answer length:', validFlashcards[0].answer.length);
      console.log('Question:', validFlashcards[0].question);
      console.log('Answer:', validFlashcards[0].answer);
    }
    
    return validFlashcards;

  } catch (error) {
    console.error('Gemini API error:', error);
    console.log('Using fallback flashcard generation');
    return generateFallbackFlashcards(text, cardCount);
  }
};