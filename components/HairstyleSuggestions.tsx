import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Hairstyle } from '../types';
import { ArrowPathIcon, LightBulbIcon, SparklesIcon, ExclamationTriangleIcon } from './icons';
import { generateHairstyleImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface HairstyleSuggestionsProps {
  suggestions: Hairstyle[];
  image: string;
  onReset: () => void;
}

const ThumbnailSpinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const HairstyleSuggestions: React.FC<HairstyleSuggestionsProps> = ({ suggestions, image, onReset }) => {
  const { t } = useTranslation();
  const [hairstyles, setHairstyles] = useState<(Hairstyle & { generationError?: boolean })[]>(suggestions);
  const [selectedHairstyleIndex, setSelectedHairstyleIndex] = useState<number | null>(null);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleThumbnailClick = async (index: number) => {
    setSelectedHairstyleIndex(index);
    setGenerationError(null);

    const hairstyle = hairstyles[index];

    // Block if another image is being generated or if the image already exists
    if (generatingIndex !== null || hairstyle.imageUrl) {
      return;
    }

    try {
      setGeneratingIndex(index);
      const imageUrl = await generateHairstyleImage(image, hairstyle);
      setHairstyles(prevStyles => {
          const newStyles = [...prevStyles];
          newStyles[index] = { ...newStyles[index], imageUrl, generationError: false };
          return newStyles;
      });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('error.unknown');
        console.error(`Failed to generate image for style ${index}:`, error);
        setGenerationError(errorMessage);
        setHairstyles(prevStyles => {
          const newStyles = [...prevStyles];
          // Ensure imageUrl is unset in case of a retry that fails
          newStyles[index] = { ...newStyles[index], generationError: true, imageUrl: undefined };
          return newStyles;
      });
    } finally {
        setGeneratingIndex(null);
    }
  };


  const selectedHairstyle = selectedHairstyleIndex !== null ? hairstyles[selectedHairstyleIndex] : null;
  const displayImage = selectedHairstyle?.imageUrl || image;
  
  return (
    <div className="w-full">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">{t('suggestions.title')}</h2>
            <p className="text-gray-400 mt-1">{t('suggestions.subtitle')}</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/3">
                <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
                    <img src={displayImage} alt={t('suggestions.tryOnAlt')} className="w-full h-full object-cover" />
                    { generatingIndex === selectedHairstyleIndex && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                            <LoadingSpinner />
                            <p className="mt-4 text-lg animate-pulse">{t('suggestions.generating')}</p>
                        </div>
                    )}
                </div>
                {generationError && selectedHairstyle?.generationError && (
                    <div className="mt-4 text-center text-red-300 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="font-bold">{t('suggestions.generationFailed')}</p>
                        <p className="text-sm">{generationError}</p>
                    </div>
                )}
                {selectedHairstyle ? (
                     <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-cyan-400">{selectedHairstyle.name}</h3>
                        <p className="mt-2 text-gray-300">{selectedHairstyle.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-start gap-3">
                            <LightBulbIcon className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-200">{t('suggestions.whyItWorks')}</h4>
                                <p className="text-sm text-gray-400">{selectedHairstyle.reason}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 text-center text-gray-400 p-4 bg-gray-800 rounded-lg">
                        <p>{t('suggestions.originalPhoto')}</p>
                    </div>
                )}
            </div>

            <div className="w-full lg:w-1/3">
                <div className="grid grid-cols-2 gap-4">
                     {hairstyles.map((style, index) => (
                        <div 
                            key={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer
                                ${selectedHairstyleIndex === index ? 'border-cyan-400 scale-105' : 'border-gray-600 hover:border-cyan-500/50'}`
                            }
                        >
                            {style.imageUrl ? (
                                <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    {generatingIndex === index ? (
                                        <ThumbnailSpinner />
                                    ) : style.generationError ? (
                                        <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                                    ) : (
                                        <SparklesIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                                <p className="text-white text-xs text-center truncate">{style.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <button 
                    onClick={onReset}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    {t('common.startOver')}
                </button>
            </div>
        </div>
    </div>
  );
};