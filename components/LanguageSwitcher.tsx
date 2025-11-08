import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const buttonStyle = "px-3 py-1 text-sm font-medium rounded-md transition-colors";
  const activeStyle = "bg-cyan-500 text-white";
  const inactiveStyle = "text-gray-400 hover:bg-gray-700 hover:text-white";

  return (
    <div className="absolute top-0 right-0 mt-2 mr-2 flex items-center bg-gray-800 border border-gray-700 rounded-lg p-1">
      <button
        onClick={() => i18n.changeLanguage('vi')}
        className={`${buttonStyle} ${i18n.language === 'vi' ? activeStyle : inactiveStyle}`}
      >
        VI
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`${buttonStyle} ${i18n.language === 'en' ? activeStyle : inactiveStyle}`}
      >
        EN
      </button>
    </div>
  );
};