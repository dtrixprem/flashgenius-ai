'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { documentsAPI, flashcardsAPI } from '@/lib/api';
import ChatbotIcon from '@/components/ChatbotIcon';
import ThemeToggle from '@/components/ThemeToggle';
import SettingsDropdown from '@/components/SettingsDropdown';
import FlashcardDebugger from '@/components/FlashcardDebugger';

interface Document {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  processingStatus: string;
  createdAt: string;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  totalCards: number;
  documentName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedCardCount, setSelectedCardCount] = useState<number>(8);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [docsResponse, decksResponse] = await Promise.all([
        documentsAPI.getAll(),
        flashcardsAPI.getDecks()
      ]);

      setDocuments(docsResponse.data.data.documents);
      setDecks(decksResponse.data.data.decks);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await documentsAPI.upload(file);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateFlashcards = async (documentId: string) => {
    setGenerating(documentId);
    try {
      const response = await documentsAPI.generateFlashcards(documentId, selectedCardCount);
      console.log('Flashcards generated successfully:', response.data);
      await fetchData();

      // Show success message
      const deck = response.data.data.deck;
      alert(`Successfully generated ${deck.totalCards} flashcards! You can now study them.`);
    } catch (error: any) {
      console.error('Flashcard generation error:', error);

      let errorMessage = 'Failed to generate flashcards';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error.message;
        if (error.response.data.error.details) {
          console.error('Error details:', error.response.data.error.details);
        }
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setGenerating(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dominant flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dominant">
      {/* Header */}
      <header className="bg-secondary shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-sans">FlashGenius AI</h1>
              <p className="text-white/75 font-mono">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white font-mono">
                Points: <span className="font-semibold text-accent-start">{user?.totalPoints || 0}</span>
              </div>
              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-accent-gradient text-dominant px-4 py-2 rounded-xl text-sm font-semibold font-sans hover:opacity-90 transition-all"
              >
                🏆 Leaderboard
              </button>
              <SettingsDropdown />
              <button
                onClick={logout}
                className="bg-secondary border border-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-semibold font-sans transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Section */}
          <div className="bg-secondary overflow-hidden shadow-lg rounded-xl mb-6 border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-semibold text-white mb-4 font-sans">
                Upload Document
              </h3>
              <div className="border-2 border-dashed border-accent-start/30 rounded-xl p-6 text-center hover:border-accent-start/50 transition-all">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                >
                  <div className="text-white">
                    {uploading ? (
                      <div className="font-mono">Uploading...</div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📄</div>
                        <div className="font-sans font-semibold">Click to upload TXT or PDF files</div>
                        <div className="text-sm text-white/75 mt-1 font-mono">Max file size: 10MB</div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Card Count Selector */}
          <div className="bg-secondary overflow-hidden shadow-lg rounded-xl mb-6 border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-semibold text-white mb-4 font-sans">
                Flashcard Generation Settings
              </h3>
              <div className="flex items-center space-x-4">
                <label className="text-white/75 font-mono text-sm">Number of cards to generate:</label>
                <select
                  value={selectedCardCount}
                  onChange={(e) => setSelectedCardCount(Number(e.target.value))}
                  className="bg-dominant text-white border border-gray-600 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-start"
                >
                  <option value={5}>5 cards</option>
                  <option value={8}>8 cards</option>
                  <option value={10}>10 cards</option>
                  <option value={12}>12 cards</option>
                  <option value={15}>15 cards</option>
                  <option value={20}>20 cards</option>
                </select>
                <span className="text-white/50 font-mono text-xs">Recommended: 8-12 cards</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documents */}
            <div className="bg-secondary overflow-hidden shadow-lg rounded-xl border border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-semibold text-white mb-4 font-sans">
                  Your Documents
                </h3>
                {documents.length === 0 ? (
                  <p className="text-white/75 font-mono text-sm">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-600 rounded-xl p-4 hover:border-accent-start/50 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white font-sans">{doc.originalName}</h4>
                            <p className="text-sm text-white/75 font-mono">
                              {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleGenerateFlashcards(doc.id)}
                            disabled={generating === doc.id}
                            className="bg-accent-gradient text-dominant px-3 py-2 rounded-xl text-sm font-semibold font-sans disabled:opacity-50 hover:opacity-90 transition-all"
                          >
                            {generating === doc.id ? 'Generating...' : 'Generate Cards'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Flashcard Decks */}
            <div className="bg-secondary overflow-hidden shadow-lg rounded-xl border border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-semibold text-white mb-4 font-sans">
                  Your Flashcard Decks
                </h3>
                {decks.length === 0 ? (
                  <p className="text-white/75 font-mono text-sm">No flashcard decks yet. Upload a document to get started!</p>
                ) : (
                  <div className="space-y-3">
                    {decks.map((deck) => (
                      <div key={deck.id} className="border border-gray-600 rounded-xl p-4 hover:border-accent-start/50 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white font-sans">{deck.title}</h4>
                            <p className="text-sm text-white/75 font-mono">
                              {deck.totalCards} cards • {new Date(deck.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/study/${deck.id}`)}
                            className="bg-accent-gradient text-dominant px-3 py-2 rounded-xl text-sm font-semibold font-sans hover:opacity-90 transition-all"
                          >
                            Study
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Debug Section - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <FlashcardDebugger />
            </div>
          )}
        </div>
      </main>

      {/* Chatbot Icon */}
      <ChatbotIcon />
    </div>
  );
}