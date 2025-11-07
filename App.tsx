
import React, { useState, useCallback } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { PreferencesForm } from './components/PreferencesForm';
import { HairstyleSuggestions } from './components/HairstyleSuggestions';
import { LoadingSpinner } from './components/LoadingSpinner';
// FIX: Removed unused import 'FaceSmileIcon' as it is not exported from './components/icons'.
import { SparklesIcon } from './components/icons';
import type { Preferences, Hairstyle } from './types';
import { getHairstyleSuggestions } from './services/geminiService';

type AppStep = 'capture' | 'preferences' | 'loading' | 'results' | 'error';

export default function App() {
  const [step, setStep] = useState<AppStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [suggestions, setSuggestions] = useState<Hairstyle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setStep('preferences');
  };

  const handlePreferencesSubmit = async (prefs: Preferences) => {
    setPreferences(prefs);
    setStep('loading');
    setError(null);

    if (!capturedImage) {
      setError("No image was captured. Please go back and take a photo.");
      setStep('error');
      return;
    }

    try {
      const result = await getHairstyleSuggestions(capturedImage, prefs);
      setSuggestions(result);
      setStep('results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating suggestions.");
      setStep('error');
    }
  };

  const handleReset = useCallback(() => {
    setStep('capture');
    setCapturedImage(null);
    setPreferences(null);
    setSuggestions([]);
    setError(null);
  }, []);

  const handleBackToCapture = useCallback(() => {
    setStep('capture');
    setCapturedImage(null);
  }, []);


  const renderStep = () => {
    switch (step) {
      case 'capture':
        return <CameraCapture onCapture={handleCapture} />;
      case 'preferences':
        if (capturedImage) {
          return (
            <PreferencesForm
              image={capturedImage}
              onSubmit={handlePreferencesSubmit}
              onBack={handleBackToCapture}
            />
          );
        }
        // Fallback if image is somehow null
        handleReset();
        return null;
      case 'loading':
        return (
          <div className="text-center text-white">
            <LoadingSpinner />
            <p className="mt-4 text-lg animate-pulse">AI is analyzing your features and finding the perfect styles...</p>
          </div>
        );
      case 'results':
        if (capturedImage) {
          return (
            <HairstyleSuggestions
              suggestions={suggestions}
              image={capturedImage}
              onReset={handleReset}
            />
          );
        }
        handleReset();
        return null;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400">An Error Occurred</h2>
            <p className="mt-2 text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-4">
                <SparklesIcon className="w-10 h-10 text-cyan-400" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                Hairstyle AI
                </h1>
            </div>
            <p className="text-gray-400 mt-2 text-lg">Find your next look with the power of AI.</p>
        </header>
        <main className="bg-gray-800/50 p-4 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 min-h-[500px] flex items-center justify-center">
          {renderStep()}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Gemini. For entertainment purposes only.</p>
        </footer>
      </div>
    </div>
  );
}