import React, { useState, useEffect } from 'react';
import { TargetLanguage, LanguageConfig, TranslationResult } from './types';
import { translateText, generateSpeech, suggestWord } from './services/geminiService';
import { playAudio } from './services/audioUtils';
import { LanguageCard } from './components/LanguageCard';
import { 
  Languages, 
  Volume2, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Loader2, 
  Mic 
} from 'lucide-react';

// Tailwind color mapping helper required for dynamic classes
// Safe list: bg-red-100, ring-red-400, text-red-600, bg-red-500, etc.
// In a real project, we would configure safelist in tailwind.config.js
// For this single-file output, we rely on standard color names that Tailwind CDN usually picks up if used explicitly.

const LANGUAGES: LanguageConfig[] = [
  { id: TargetLanguage.SPANISH, flag: '🇪🇸', color: 'orange', greeting: 'Hola!' },
  { id: TargetLanguage.FRENCH, flag: '🇫🇷', color: 'blue', greeting: 'Bonjour!' },
  { id: TargetLanguage.GERMAN, flag: '🇩🇪', color: 'yellow', greeting: 'Hallo!' },
  { id: TargetLanguage.ITALIAN, flag: '🇮🇹', color: 'green', greeting: 'Ciao!' },
  { id: TargetLanguage.JAPANESE, flag: '🇯🇵', color: 'red', greeting: 'Konnichiwa!' },
  { id: TargetLanguage.CHINESE, flag: '🇨🇳', color: 'red', greeting: 'Ni Hao!' },
  { id: TargetLanguage.RUSSIAN, flag: '🇷🇺', color: 'indigo', greeting: 'Privet!' },
  { id: TargetLanguage.HINDI, flag: '🇮🇳', color: 'orange', greeting: 'Namaste!' },
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState<LanguageConfig>(LANGUAGES[0]);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    setTranslation(null); // Clear previous result

    try {
      const result = await translateText(inputText, selectedLang.id);
      setTranslation(result);
    } catch (e) {
      setError("Oops! Something went wrong. Try again!");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async () => {
    if (!translation) return;

    setIsSpeaking(true);
    try {
      const audioData = await generateSpeech(translation.translatedText, selectedLang.id);
      await playAudio(audioData);
    } catch (e) {
      console.error(e);
      setError("Could not play audio. Check your volume!");
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSuggest = async () => {
    setInputText("Thinking...");
    const word = await suggestWord();
    setInputText(word);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only letters and spaces (regex: ^[A-Za-z\s]*$)
    if (/^[A-Za-z\s]*$/.test(newValue)) {
      setInputText(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  // Pre-load a suggestion on mount
  useEffect(() => {
    if(!inputText) handleSuggest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 md:p-8 font-['Fredoka']">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center mb-8 text-center animate-fade-in-down">
          <div className="bg-white p-3 rounded-full shadow-lg mb-4 transform hover:rotate-12 transition-transform duration-300">
            <Languages size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 mb-2 tracking-tight">
            KiddoTranslate
          </h1>
          <p className="text-lg text-indigo-700 opacity-80 max-w-lg">
            Type a word, pick a flag, and hear the magic happen!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl ring-1 ring-indigo-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
               
               <div className="mb-4 flex justify-between items-center">
                 <label className="text-xl font-bold text-gray-700">English Word</label>
                 <button 
                  onClick={handleSuggest}
                  className="flex items-center text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                 >
                   <Sparkles size={14} className="mr-1" />
                   New Word
                 </button>
               </div>

               <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type here... (letters only)"
                  className="w-full text-3xl font-bold text-gray-800 border-b-4 border-gray-100 focus:border-indigo-400 outline-none py-2 bg-transparent placeholder-gray-300 transition-colors"
                />
               </div>
               <div className="mt-2 text-xs text-gray-400 text-right">
                 Only letters allowed
               </div>
            </div>

            {/* Language Grid */}
            <div className="bg-white rounded-3xl p-6 shadow-xl ring-1 ring-indigo-100">
               <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                 <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                   <ArrowRight size={18} />
                 </span>
                 Choose a Language
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {LANGUAGES.map((lang) => (
                   <LanguageCard 
                      key={lang.id} 
                      config={lang} 
                      isSelected={selectedLang.id === lang.id}
                      onClick={() => setSelectedLang(lang)}
                   />
                 ))}
               </div>
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText}
              className={`
                w-full py-4 rounded-2xl text-2xl font-bold text-white shadow-xl transform transition-all duration-200
                flex items-center justify-center space-x-3
                ${isTranslating || !inputText 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]'}
              `}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={28} className="fill-current" />
                  <span>Translate!</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-xl text-center font-bold animate-pulse">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="flex flex-col h-full">
            <div className={`
              flex-1 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 flex flex-col items-center justify-center text-center
              ${translation ? 'bg-gradient-to-b from-white to-indigo-50 border-4 border-indigo-200' : 'bg-white/50 border-4 border-dashed border-indigo-100'}
            `}>
              
              {!translation ? (
                <div className="text-indigo-300 flex flex-col items-center opacity-70">
                   <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                     <span className="text-6xl">✨</span>
                   </div>
                   <p className="text-xl font-medium">Your translation will appear here!</p>
                </div>
              ) : (
                <div className="w-full animate-fade-in-up">
                  
                  {/* Emoji Banner */}
                  <div className="mb-6 transform hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <span className="text-8xl md:text-9xl filter drop-shadow-lg">{translation.emoji}</span>
                  </div>

                  {/* Translated Text */}
                  <div className="mb-2">
                    <h2 className="text-4xl md:text-6xl font-black text-indigo-900 tracking-tight break-words">
                      {translation.translatedText}
                    </h2>
                  </div>

                  {/* Phonetic & Guide */}
                  <div className="mb-8 flex flex-col items-center">
                     <span className="inline-block bg-purple-100 text-purple-700 px-5 py-2 rounded-full text-xl md:text-2xl font-bold border-2 border-purple-200 mb-2 shadow-sm">
                       / {translation.phonetic} /
                     </span>
                     <p className="text-indigo-500 font-medium text-lg italic bg-white/50 px-4 py-1 rounded-lg">
                       <span className="mr-2 not-italic">🗣️</span> 
                       {translation.pronunciationNote}
                     </p>
                  </div>

                  {/* Fun Fact / Context */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-8 text-left max-w-md mx-auto">
                    <p className="text-yellow-800 italic font-medium">
                      💡 {translation.funFact}
                    </p>
                  </div>

                  {/* Audio Control */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSpeak}
                      disabled={isSpeaking}
                      className={`
                        group relative flex items-center justify-center w-24 h-24 rounded-full shadow-2xl transition-all duration-300
                        ${isSpeaking 
                          ? 'bg-gray-100 ring-4 ring-gray-200 scale-95' 
                          : 'bg-gradient-to-br from-green-400 to-emerald-500 hover:scale-110 active:scale-90 ring-4 ring-green-200'}
                      `}
                    >
                      {isSpeaking ? (
                        <div className="space-x-1 flex items-center justify-center h-8">
                          <div className="w-2 h-8 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-8 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                          <div className="w-2 h-8 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                        </div>
                      ) : (
                        <Volume2 size={48} className="text-white fill-current ml-1" />
                      )}
                      
                      {!isSpeaking && (
                         <span className="absolute -bottom-8 text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                           Listen!
                         </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Reset helper */}
            {translation && (
               <div className="mt-4 flex justify-center">
                 <button 
                  onClick={() => { setTranslation(null); setInputText(''); }}
                  className="flex items-center text-gray-500 hover:text-indigo-500 font-semibold transition-colors"
                 >
                   <RotateCcw size={16} className="mr-2" />
                   Start Over
                 </button>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;