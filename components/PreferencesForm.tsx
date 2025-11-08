import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Preferences } from '../types';
import { ArrowPathIcon, SparklesIcon, FaceSmileIcon } from './icons';

interface PreferencesFormProps {
  image: string;
  faceShape: string | null;
  onSubmit: (prefs: Preferences) => void;
  onBack: () => void;
}

const formLabelStyle = "block mb-2 text-sm font-medium text-gray-300";
const formInputStyle = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5";

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ image, faceShape, onSubmit, onBack }) => {
  const { t } = useTranslation();
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
            <img src={image} alt={t('preferences.capturedFaceAlt')} className="rounded-lg shadow-lg w-full aspect-square object-cover" />
            {faceShape && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-center border border-gray-600">
                    <p className="text-sm text-gray-400">{t('faceShape.title')}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <FaceSmileIcon className="w-5 h-5 text-cyan-400" />
                        <p className="font-bold text-white text-lg">{faceShape}</p>
                    </div>
                </div>
            )}
            <button 
                onClick={onBack}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
                <ArrowPathIcon className="w-5 h-5" />
                {t('common.retakePhoto')}
            </button>
        </div>
        <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">{t('preferences.title')}</h2>
            <div>
                <label htmlFor="length" className={formLabelStyle}>{t('preferences.lengthLabel')}</label>
                <select id="length" value={length} onChange={(e) => setLength(e.target.value as Preferences['length'])} className={formInputStyle}>
                    <option value="any">{t('preferences.anyLength')}</option>
                    <option value="short">{t('preferences.short')}</option>
                    <option value="medium">{t('preferences.medium')}</option>
                    <option value="long">{t('preferences.long')}</option>
                </select>
            </div>
            <div>
                <label htmlFor="style" className={formLabelStyle}>{t('preferences.styleLabel')}</label>
                <select id="style" value={style} onChange={(e) => setStyle(e.target.value as Preferences['style'])} className={formInputStyle}>
                    <option value="any">{t('preferences.anyStyle')}</option>
                    <option value="straight">{t('preferences.straight')}</option>
                    <option value="wavy">{t('preferences.wavy')}</option>
                    <option value="curly">{t('preferences.curly')}</option>
                    <option value="coily">{t('preferences.coily')}</option>
                </select>
            </div>
            <div>
                <label htmlFor="vibe" className={formLabelStyle}>{t('preferences.vibeLabel')}</label>
                <input
                    type="text"
                    id="vibe"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className={formInputStyle}
                    placeholder={t('preferences.vibePlaceholder')}
                />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-3 px-5 py-3 text-base font-medium text-center text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 focus:ring-4 focus:outline-none focus:ring-cyan-300 transition-transform transform hover:scale-105">
                <SparklesIcon className="w-6 h-6" />
                {t('preferences.submitButton')}
            </button>
        </form>
    </div>
  );
};