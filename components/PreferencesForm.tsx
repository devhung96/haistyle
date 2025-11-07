
import React, { useState } from 'react';
import type { Preferences } from '../types';
import { ArrowPathIcon, SparklesIcon } from './icons';

interface PreferencesFormProps {
  image: string;
  onSubmit: (prefs: Preferences) => void;
  onBack: () => void;
}

const formLabelStyle = "block mb-2 text-sm font-medium text-gray-300";
const formInputStyle = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5";

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ image, onSubmit, onBack }) => {
  const [length, setLength] = useState<Preferences['length']>('any');
  const [style, setStyle] = useState<Preferences['style']>('any');
  const [vibe, setVibe] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ length, style, vibe });
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/3 flex-shrink-0">
            <img src={image} alt="Captured face" className="rounded-lg shadow-lg w-full aspect-square object-cover" />
            <button 
                onClick={onBack}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
                <ArrowPathIcon className="w-5 h-5" />
                Retake Photo
            </button>
        </div>
        <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Tell us your preferences</h2>
            <div>
                <label htmlFor="length" className={formLabelStyle}>Preferred Length</label>
                <select id="length" value={length} onChange={(e) => setLength(e.target.value as Preferences['length'])} className={formInputStyle}>
                    <option value="any">Any Length</option>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                </select>
            </div>
            <div>
                <label htmlFor="style" className={formLabelStyle}>Preferred Style</label>
                <select id="style" value={style} onChange={(e) => setStyle(e.target.value as Preferences['style'])} className={formInputStyle}>
                    <option value="any">Any Style</option>
                    <option value="straight">Straight</option>
                    <option value="wavy">Wavy</option>
                    <option value="curly">Curly</option>
                    <option value="coily">Coily</option>
                </select>
            </div>
            <div>
                <label htmlFor="vibe" className={formLabelStyle}>Describe your desired vibe</label>
                <input
                    type="text"
                    id="vibe"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className={formInputStyle}
                    placeholder="e.g., professional, casual, edgy, formal event"
                />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-3 px-5 py-3 text-base font-medium text-center text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 focus:ring-4 focus:outline-none focus:ring-cyan-300 transition-transform transform hover:scale-105">
                <SparklesIcon className="w-6 h-6" />
                Get AI Suggestions
            </button>
        </form>
    </div>
  );
};
