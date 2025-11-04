'use client';

import { useState } from 'react';

export default function FlashcardDebugger() {
  const [testText, setTestText] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGeneration = async () => {
    if (!testText.trim() || testText.length < 50) {
      alert('Please enter at least 50 characters of text');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          cardCount: 5
        })
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Test failed:', error);
      setResults({ success: false, error: 'Test failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 font-sans">
        Flashcard Generation Debugger
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/75 font-mono mb-2">
            Test Text (minimum 50 characters):
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-dominant text-white border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono resize-vertical focus:outline-none focus:ring-2 focus:ring-accent-start"
            rows={6}
            placeholder="Enter some text to test flashcard generation..."
          />
          <div className="text-xs text-white/50 font-mono mt-1">
            Characters: {testText.length}
          </div>
        </div>

        <button
          onClick={testGeneration}
          disabled={loading || testText.length < 50}
          className="bg-accent-gradient text-dominant px-4 py-2 rounded-xl text-sm font-semibold font-sans disabled:opacity-50 hover:opacity-90 transition-all"
        >
          {loading ? 'Generating...' : 'Test Generation'}
        </button>

        {results && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-white mb-3 font-sans">Results:</h4>
            
            {results.success ? (
              <div className="space-y-4">
                {/* Debug Info */}
                {results.data.debug && (
                  <div className="bg-dominant rounded-lg p-4 border border-gray-600">
                    <h5 className="text-sm font-semibold text-accent-start mb-2 font-mono">Debug Info:</h5>
                    <div className="text-xs text-white/75 font-mono space-y-1">
                      <div>Total Cards: {results.data.debug.totalCards}</div>
                      <div>Average Question Length: {results.data.debug.averageQuestionLength}</div>
                      <div>Average Answer Length: {results.data.debug.averageAnswerLength}</div>
                      <div>Shortest Question: {results.data.debug.shortestQuestion} chars</div>
                      <div>Longest Question: {results.data.debug.longestQuestion} chars</div>
                      <div>Shortest Answer: {results.data.debug.shortestAnswer} chars</div>
                      <div>Longest Answer: {results.data.debug.longestAnswer} chars</div>
                      <div>Using Fallback: {results.data.usingFallback ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}

                {/* Generated Cards */}
                <div className="space-y-3">
                  {results.data.flashcards.map((card: any, index: number) => (
                    <div key={index} className="bg-dominant rounded-lg p-4 border border-gray-600">
                      <div className="mb-2">
                        <span className="text-xs text-accent-start font-mono">Question ({card.question.length} chars):</span>
                        <div className="text-sm text-white font-mono mt-1 whitespace-pre-wrap">
                          {card.question}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-accent-end font-mono">Answer ({card.answer.length} chars):</span>
                        <div className="text-sm text-white font-mono mt-1 whitespace-pre-wrap">
                          {card.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                <div className="text-red-400 font-mono text-sm">
                  Error: {results.error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}