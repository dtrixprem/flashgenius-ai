'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router, mounted]);

  // Show loading only after component is mounted to avoid hydration issues
  if (!mounted || loading) {
    return <LoadingSpinner message="Loading FlashGenius AI..." />;
  }

  return (
    <div className="min-h-screen bg-dominant">
      {/* Navigation */}
      <header className="w-full text-white py-2">
        <nav className="max-w-7xl mx-auto grid grid-cols-3 items-center">
          {/* Left: Logo */}
          <div className="flex justify-start">
          <img src="/logo.PNG" alt="FG" className="h-20 w-20" />
        </div>

          {/* Middle: Navigation Links */}
          <ul className="flex justify-center space-x-6">
            <li>
              <a href="#features" className="hover:text-accent-start transition font-sans text-lg font-semibold">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-accent-start transition font-sans text-lg font-semibold">
                How it works?
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-accent-start transition font-sans text-lg font-semibold">
                Pricing
              </a>
            </li>
          </ul>

          {/* Right: Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/login"
              className="bg-secondary uppercase text-white rounded-xl py-3 px-4 font-sans font-semibold hover:opacity-75 transition"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-accent-gradient hover:opacity-75 transition text-dominant font-sans font-semibold py-3 px-4 rounded-xl uppercase"
            >
              Get Started for free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-[80vh] w-full flex flex-col justify-center items-center text-white px-6">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl">
          <div className="flex flex-col w-full items-start justify-center text-left flex-1">
            <h1 className="text-5xl flex md:text-4xl font-extrabold font-sans leading-tight">
              <span className="text-accent-start mr-2">Learning</span>is effective with<span 
              className="text-accent-gradient ml-2">FlashGenius</span>
            </h1>
            <p className="text-white/75 max-w-xl w-full font-mono leading-relaxed text-xs mt-4">
              Experience FlashGenius — an intelligent, inclusive platform where you can learn and get assessed seamlessly,
              ensuring fair, adaptive, and accessible skill development for all.
            </p>
            <button className="mt-4 bg-secondary text-white font-mono font-bold py-3 px-6 rounded-3xl hover:opacity-70 transition flex items-center gap-2">
              Unlock Your Learning Flow. Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex justify-center">
          <img
            src="/books.gif"
            alt="Hero GIF"
            className="w-[25vw] max-w-[300px] h-auto object-contain mix-blend-screen"
          />
        </div>
        </div>
        <div className="pt-20 flex justify-center w-full">
          <Link
            href="/register"
            className="bg-accent-gradient text-dominant font-sans font-black py-3 px-8 rounded-xl uppercase text-2xl hover:opacity-80 hover:drop-shadow-lg transition"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold font-sans text-white mb-4">How It Works?</h2>
            <p className="text-xl text-white/75 font-mono">Your Path to Smarter Learning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-dominant font-bold font-mono text-xl">01</span>
              </div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">Upload Your Documents</h3>
              <p className="text-white/75 font-mono text-sm">Simply drag and drop your study materials - PDFs, text files, or any document you want to learn from.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-dominant font-bold font-mono text-xl">02</span>
              </div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">AI Creates Flashcards</h3>
              <p className="text-white/75 font-mono text-sm">Our advanced AI analyzes your content and automatically generates intelligent flashcards tailored to your material.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-dominant font-bold font-mono text-xl">03</span>
              </div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">Study & Compete</h3>
              <p className="text-white/75 font-mono text-sm">Review your flashcards, earn points, and climb the leaderboard while mastering your subjects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold font-sans text-white mb-4">Features</h2>
            <p className="text-xl text-white/75 font-mono">Why Choose FlashGenius?</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-secondary rounded-xl p-6 border border-gray-700 hover:border-accent-start/50 transition-all">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">AI-Powered</h3>
              <p className="text-white/75 font-mono text-sm">
                Advanced AI automatically generates high-quality flashcards from your documents
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-6 border border-gray-700 hover:border-accent-start/50 transition-all">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">Smart Learning</h3>
              <p className="text-white/75 font-mono text-sm">
                Adaptive study sessions that focus on your weak areas for efficient learning
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-6 border border-gray-700 hover:border-accent-start/50 transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">Gamified</h3>
              <p className="text-white/75 font-mono text-sm">
                Earn points and track your progress to stay motivated while learning
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-6 border border-gray-700 hover:border-accent-start/50 transition-all">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold font-sans text-white mb-2">Competitive</h3>
              <p className="text-white/75 font-mono text-sm">
                Compete with other learners on leaderboards and track your global ranking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold font-sans text-white mb-4">CHOOSE YOUR PLAN</h2>
            <p className="text-xl text-white/75 font-mono">Start your learning journey today</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-secondary rounded-xl p-8 border border-gray-700 hover:border-accent-start/50 transition-all">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-accent-start mb-2 font-mono uppercase tracking-wider">FREE</h3>
                <div className="text-4xl font-bold text-white mb-2 font-sans">$0</div>
                <p className="text-white/75 font-mono text-sm">Perfect for getting started with smart learning</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload unlimited documents
                </li>
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Generate unlimited flashcards
                </li>
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access to leaderboards
                </li>
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Study progress tracking
                </li>
              </ul>

              <Link
                href="/register"
                className="w-full bg-accent-gradient text-dominant py-3 px-6 rounded-xl font-sans font-semibold hover:opacity-90 transition-all text-center block uppercase"
              >
                GET STARTED
              </Link>
            </div>

            {/* Pro Plan - Coming Soon */}
            <div className="bg-secondary/50 rounded-xl p-8 border border-accent-start/30 relative opacity-75">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent-gradient text-dominant px-4 py-1 rounded-full text-sm font-semibold font-mono uppercase">
                  COMING SOON
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-accent-start mb-2 font-mono uppercase tracking-wider">PRO</h3>
                <div className="text-4xl font-bold text-white mb-2 font-sans">$11.99</div>
                <p className="text-white/75 font-mono text-sm">For serious learners who want advanced features</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced AI modes
                </li>
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center text-white/75 font-mono text-sm">
                  <svg className="w-5 h-5 text-accent-start mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom study modes
                </li>
              </ul>

              <button
                disabled
                className="w-full bg-secondary text-white/50 py-3 px-6 rounded-xl font-sans font-semibold cursor-not-allowed text-center block uppercase"
              >
                COMING SOON
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold font-sans text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-white/75 font-mono text-sm mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already using FlashGenius to accelerate their learning journey.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center bg-accent-gradient text-dominant px-8 py-4 rounded-xl text-lg font-sans font-black hover:opacity-90 transition-all shadow-lg hover:shadow-xl uppercase"
          >
            GET STARTED FOR FREE
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="flex justify-center">
           <img src="/logo.PNG" alt="FG" className="h-20 w-20" />
        </div>
            <span className="text-white/75 font-mono text-sm">© 2025 CardFlow. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-white/75 hover:text-accent-start transition-colors font-mono text-sm">Privacy Policy</Link>
            <Link href="#" className="text-white/75 hover:text-accent-start transition-colors font-mono text-sm">Terms of Service</Link>
            <Link href="#" className="text-white/75 hover:text-accent-start transition-colors font-mono text-sm">Support</Link>
          </div>
        </div>
      </footer>


    </div>
  );
}