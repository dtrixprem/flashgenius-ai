'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { flashcardsAPI } from '@/lib/api';

interface Card {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
}

interface StudySession {
  id: string;
  deckId: string;
  startedAt: string;
}

export default function StudyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const [session, setSession] = useState<StudySession | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [cardResults, setCardResults] = useState<Array<{cardId: string, correct: boolean}>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    startStudySession();
  }, [user, router, deckId]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      console.log('Speaking text:', text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      // Wait a bit for the speech synthesis to be ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  const handleAnswer = (correct: boolean) => {
    const currentCard = cards[currentCardIndex];
    
    setCardsReviewed(prev => prev + 1);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setCardResults(prev => [...prev, { cardId: currentCard.id, correct }]);
    
    // Move to next card or finish session
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    if (!session) return;
    
    try {
      const response = await flashcardsAPI.completeStudySession(session.id, {
        cardsReviewed: cardsReviewed + 1, // +1 for the current card
        correctAnswers: correctAnswers + (cardResults[cardResults.length - 1]?.correct ? 1 : 0),
        cardResults: [...cardResults, { cardId: cards[currentCardIndex].id, correct: true }]
      });
      
      const { pointsEarned, accuracy } = response.data.data.session;
      
      // Show completion celebration
      const accuracyPercent = Math.round(accuracy * 100);
      let message = `🎉 Session Complete!\n\n`;
      message += `📊 Cards Reviewed: ${cardsReviewed + 1}\n`;
      message += `✅ Correct Answers: ${correctAnswers + (cardResults[cardResults.length - 1]?.correct ? 1 : 0)}\n`;
      message += `🎯 Accuracy: ${accuracyPercent}%\n`;
      message += `⭐ Points Earned: ${pointsEarned}\n\n`;
      
      if (accuracyPercent >= 90) {
        message += `🏆 Excellent work! You're a flashcard master!`;
      } else if (accuracyPercent >= 75) {
        message += `👏 Great job! Keep up the good work!`;
      } else if (accuracyPercent >= 50) {
        message += `💪 Good effort! Practice makes perfect!`;
      } else {
        message += `📚 Keep studying! You'll improve with practice!`;
      }
      
      alert(message);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete session:', error);
      router.push('/dashboard');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        }
      } else if (event.key === '1' && showAnswer) {
        event.preventDefault();
        handleAnswer(false);
      } else if (event.key === '2' && showAnswer) {
        event.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, cards, currentCardIndex]);

  const startStudySession = async () => {
    try {
      const response = await flashcardsAPI.startStudySession(deckId);
      const { session, cards } = response.data.data;
      
      setSession(session);
      setCards(cards);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to start study session:', error);
      alert('Failed to start study session');
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dominant flex items-center justify-center">
        <div className="text-lg text-white font-mono">Loading study session...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-dominant flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4 font-sans">No cards available</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-accent-gradient text-dominant px-4 py-2 rounded-xl font-semibold font-sans hover:opacity-90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-dominant">
      {/* Header */}
      <header className="bg-secondary shadow-lg border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white/75 hover:text-white font-mono transition-colors"
            >
              ← Back to Dashboard
            </button>
            
            <div className="text-sm text-white/75 font-mono">
              Card {currentCardIndex + 1} of {cards.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-secondary border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="w-full bg-dominant rounded-full h-3">
            <div
              className="bg-accent-gradient h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary rounded-xl shadow-lg overflow-hidden border border-gray-700">
          {/* Card Header */}
          <div className="bg-accent-gradient px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-dominant text-sm font-semibold font-mono">
                Card {currentCardIndex + 1} of {cards.length}
              </div>
              <h2 className="text-xl font-bold text-dominant font-sans">
                {showAnswer ? '💡 Answer' : '❓ Question'}
              </h2>
              <div className="text-dominant text-sm font-semibold font-mono">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-8 min-h-[400px] flex flex-col">
            <div className="flex-1 flex items-start justify-center py-4">
              <div className="w-full max-w-4xl">
                <div className="text-left">
                  <div className="bg-dominant rounded-xl p-8 mb-8 border-l-4 border-accent-start relative min-h-[200px]">
                    {/* Speaker Button */}
                    <button
                      onClick={() => {
                        const textToSpeak = showAnswer ? currentCard.answer : currentCard.question;
                        speakText(textToSpeak);
                      }}
                      disabled={isSpeaking}
                      className="absolute top-4 right-4 bg-accent-gradient text-dominant p-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                      title="Read aloud"
                    >
                      {isSpeaking ? (
                        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM16 8a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM15.707 6.293a1 1 0 010 1.414L13.414 10l2.293 2.293a1 1 0 01-1.414 1.414L12 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 10 8.293 7.707a1 1 0 011.414-1.414L12 8.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Card Text */}
                    <div className="text-base md:text-lg text-white leading-relaxed whitespace-pre-wrap break-words font-mono max-w-none overflow-visible text-left pr-16">
                      {showAnswer ? currentCard.answer : currentCard.question}
                    </div>
                    
                    {/* Debug Info - Character Count */}
                    <div className="absolute bottom-2 left-4 text-xs text-white/50 font-mono">
                      {showAnswer ? 'Answer' : 'Question'}: {(showAnswer ? currentCard.answer : currentCard.question).length} chars
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-6">
              {!showAnswer ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-accent-gradient text-dominant px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:opacity-90 font-sans"
                  >
                    🔍 Show Answer
                  </button>
                  <div className="mt-2 text-sm text-white/75 font-mono">
                    Press <kbd className="px-2 py-1 bg-dominant rounded text-white">Space</kbd> or <kbd className="px-2 py-1 bg-dominant rounded text-white">Enter</kbd>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg hover:shadow-xl font-sans"
                    >
                      ❌ Incorrect
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg hover:shadow-xl font-sans"
                    >
                      ✅ Correct
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-white/75 font-mono">
                    Press <kbd className="px-2 py-1 bg-dominant rounded text-white">1</kbd> for Incorrect or <kbd className="px-2 py-1 bg-dominant rounded text-white">2</kbd> for Correct
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 bg-secondary rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 text-center font-sans">Session Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center bg-accent-start/10 rounded-xl p-4 border border-accent-start/20">
              <div className="text-2xl font-bold text-accent-start font-mono">{cardsReviewed}</div>
              <div className="text-sm text-white/75 font-mono">Cards Reviewed</div>
            </div>
            <div className="text-center bg-green-600/10 rounded-xl p-4 border border-green-600/20">
              <div className="text-2xl font-bold text-green-400 font-mono">{correctAnswers}</div>
              <div className="text-sm text-white/75 font-mono">Correct Answers</div>
            </div>
            <div className="text-center bg-accent-end/10 rounded-xl p-4 border border-accent-end/20">
              <div className="text-2xl font-bold text-accent-end font-mono">
                {cardsReviewed > 0 ? Math.round((correctAnswers / cardsReviewed) * 100) : 0}%
              </div>
              <div className="text-sm text-white/75 font-mono">Accuracy</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}