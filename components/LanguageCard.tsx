import React from 'react';
import { LanguageConfig } from '../types';

interface LanguageCardProps {
  config: LanguageConfig;
  isSelected: boolean;
  onClick: () => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ config, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 active:scale-95 text-left w-full h-full
        ${isSelected 
          ? `bg-${config.color}-100 ring-4 ring-${config.color}-400 shadow-lg` 
          : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 shadow-sm'}
      `}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <span className="text-4xl filter drop-shadow-md" role="img" aria-label={config.id}>
          {config.flag}
        </span>
        <span className={`font-bold text-sm md:text-base ${isSelected ? `text-${config.color}-600` : 'text-gray-600'}`}>
          {config.id}
        </span>
      </div>
      
      {isSelected && (
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-${config.color}-500 animate-pulse`} />
      )}
    </button>
  );
};