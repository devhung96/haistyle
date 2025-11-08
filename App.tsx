import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from './components/CameraCapture';
import { PreferencesForm } from './components/PreferencesForm';
import { HairstyleSuggestions } from './components/HairstyleSuggestions';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons';
import type { Preferences, Hairstyle } from './types';
import { getHairstyleSuggestions, analyzeFaceShape } from './services/geminiService';
import { LanguageSwitcher } from './components/LanguageSwitcher';

type AppStep = 'capture' | 'analyzing' | 'preferences' | 'loading' | 'results' | 'error';

export default function App() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<AppStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [suggestions, setSuggestions] = useState<Hairstyle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setStep('analyzing');
    setError(null);
    try {
      const language = i18n.language as 'en' | 'vi';
      const shape = await analyzeFaceShape(imageDataUrl, language);
      setFaceShape(shape);
      setStep('preferences');
    } catch (err) {
      console.error("Face shape analysis failed, proceeding without it.", err);
      // Proceed even if analysis fails
      setFaceShape(t('faceShape.analysisFailed'));
      setStep('preferences');
    }
  };

  const handlePreferencesSubmit = async (prefs: Preferences) => {
    setPreferences(prefs);
    setStep('loading');
    setError(null);

    if (!capturedImage) {
      setError(t('error.noImage'));
      setStep('error');
      return;
    }

    try {
      const language = i18n.language as 'en' | 'vi';
      const result = await getHairstyleSuggestions(capturedImage, prefs, faceShape, language);
      setSuggestions(result);
      setStep('results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
      setStep('error');
    }
  };

  const handleReset = useCallback(() => {
    setStep('capture');
    setCapturedImage(null);
    setPreferences(null);
    setSuggestions([]);
    setError(null);
    setFaceShape(null);
  }, []);

  const handleBackToCapture = useCallback(() => {
    setStep('capture');
    setCapturedImage(null);
    setFaceShape(null);
  }, []);


  const renderStep = () => {
    switch (step) {
      case 'capture':
        return <CameraCapture onCapture={handleCapture} />;
      case 'analyzing':
        return (
          <div className="text-center text-white">
            <LoadingSpinner />
            <p className="mt-4 text-lg animate-pulse">{t('app.analyzing')}</p>
          </div>
        );
      case 'preferences':
        if (capturedImage) {
          return (
            <PreferencesForm
              image={capturedImage}
              faceShape={faceShape}
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
            <p className="mt-4 text-lg animate-pulse">{t('app.loading')}</p>
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
            <h2 className="text-2xl font-bold text-red-400">{t('error.title')}</h2>
            <p className="mt-2 text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('common.startOver')}
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
        <header className="text-center mb-4 relative">
            <div className="flex items-center justify-center gap-4">
                <SparklesIcon className="w-10 h-10 text-cyan-400" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                {t('app.title')}
                </h1>
            </div>
            <p className="text-gray-400 mt-2 text-lg">{t('app.tagline')}</p>
            <LanguageSwitcher />
        </header>
        <main className="bg-gray-800/50 p-4 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 min-h-[500px] flex items-center justify-center">
          {renderStep()}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>{t('app.footer')}</p>
        </footer>
      </div>
    </div>
  );
}