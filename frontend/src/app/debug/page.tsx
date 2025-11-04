'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mongoStatus, setMongoStatus] = useState('unknown');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        setBackendStatus('online');
        
        // Try to check if MongoDB is connected by making an API call
        try {
          const authResponse = await fetch('http://localhost:3001/api/auth/profile', {
            headers: { 'Authorization': 'Bearer invalid-token' }
          });
          // If we get a 401 (unauthorized), it means the API is working
          if (authResponse.status === 401) {
            setMongoStatus('connected');
          }
        } catch (error) {
          setMongoStatus('disconnected');
        }
      } catch (error) {
        setBackendStatus('offline');
        setMongoStatus('unknown');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">FlashGenius AI Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Frontend:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                ✅ Online
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Backend (Port 3001):</span>
              <span className={`px-2 py-1 rounded text-sm ${
                backendStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : backendStatus === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {backendStatus === 'online' ? '✅ Online' : 
                 backendStatus === 'offline' ? '❌ Offline' : '🔍 Checking...'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>MongoDB:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                mongoStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : mongoStatus === 'disconnected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {mongoStatus === 'connected' ? '✅ Connected' : 
                 mongoStatus === 'disconnected' ? '❌ Disconnected' : '❓ Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:3001/api/test/generate-flashcards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      text: 'The solar system consists of the Sun and the celestial objects that orbit it. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet has unique characteristics and features that make it distinct from the others.' 
                    })
                  });
                  const data = await response.json();
                  alert(`Test successful! Generated ${data.data?.count || 0} flashcards. Using fallback: ${data.data?.usingFallback ? 'Yes' : 'No'}`);
                } catch (error) {
                  alert('Test failed: ' + error);
                }
              }}
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-center"
            >
              Test Flashcard Generation
            </button>
            <Link 
              href="/register" 
              className="block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-center"
            >
              Test Registration
            </Link>
            <Link 
              href="/login" 
              className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
            >
              Test Login
            </Link>
            <Link 
              href="/" 
              className="block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>If Backend is Offline:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check if backend server is running on port 3001</li>
              <li>Run: <code className="bg-gray-100 px-1 rounded">cd backend && npm run dev</code></li>
            </ul>
            
            <p className="mt-4"><strong>If MongoDB is Disconnected:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check your internet connection</li>
              <li>Verify MongoDB Atlas connection string in backend/.env</li>
              <li>Ensure your IP is whitelisted in MongoDB Atlas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}