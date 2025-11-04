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
      const questionTypes = [
        `What does this text state: "${sentence.substring(0, 40)}..."?`,
        `According to the document, what is mentioned about "${sentence.split(' ').slice(0, 5).join(' ')}"?`,
        `Complete this statement: "${sentence.substring(0, 30)}..."`,
        `What information is provided about: ${sentence.split(' ').slice(0, 3).join(' ')}?`
      ];
      
      flashcards.push({
        question: questionTypes[i % questionTypes.length],
        answer: sentence
      });
    }
  }
  
  // Add some general questions if we have fewer cards
  if (flashcards.length < actualCardCount) {
    const words = text.split(' ').filter(w => w.length > 4);
    const keyWords = words.slice(0, 10);
    
    keyWords.forEach((word, index) => {
      if (flashcards.length < actualCardCount) {
        flashcards.push({
          question: `What is the significance of "${word}" in this context?`,
          answer: `"${word}" appears in the document and is relevant to the main topic being discussed.`
        });
      }
    });
  }
  
  return flashcards.length > 0 ? flashcards : [{
    question: "What is the main topic of this document?",
    answer: "This document contains information that can be studied using flashcards."
  }];
};

export const generateFlashcards = async (text: string, cardCount: number = 10): Promise<GeneratedFlashcard[]> => {
  // Validate input
  if (!text || text.trim().length < 50) {
    throw new Error('Text content is too short to generate flashcards');
  }

  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.warn('Gemini API key not configured, using fallback flashcards');
    return generateFallbackFlashcards(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Limit text length to avoid API limits
    const limitedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;

    const actualCardCount = Math.max(5, Math.min(20, cardCount)); // Ensure between 5-20 cards
    
    const prompt = `Create exactly ${actualCardCount} high-quality flashcards from this text. Generate a good mix of different question types:
- Factual questions (What, Who, When, Where)
- Conceptual questions (Why, How)
- Definition questions
- Application questions

Return ONLY a valid JSON array with no additional text or formatting.

Text: ${limitedText}

Return format (no markdown, no explanations):
[{"question":"What is...?","answer":"The answer is..."}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();

    console.log('Gemini API raw response:', generatedText);

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

    // Validate and clean each flashcard
    const validFlashcards = flashcards
      .filter(card => 
        card && 
        typeof card === 'object' &&
        card.question && 
        card.answer && 
        typeof card.question === 'string' && 
        typeof card.answer === 'string' &&
        card.question.trim().length > 5 &&
        card.answer.trim().length > 5
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
    return validFlashcards;

  } catch (error) {
    console.error('Gemini API error:', error);
    console.log('Using fallback flashcard generation');
    return generateFallbackFlashcards(text, cardCount);
  }
};