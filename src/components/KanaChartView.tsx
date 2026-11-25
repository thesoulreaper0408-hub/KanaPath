import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { HIRAGANA_CHARS, KATAKANA_CHARS } from '../data/kanaChart';
import type { ItemMasteryRecord, KanaChar } from '../types/learning';
import { playSoundEffect, speakJapanese } from '../utils/sound';
import { TurtleIcon } from './JapaneseDisplay';

interface KanaChartViewProps {
  soundEnabled: boolean;
  showRomaji: boolean;
  mastery: Record<string, ItemMasteryRecord>;
}

export function KanaChartView({ soundEnabled, showRomaji, mastery }: KanaChartViewProps) {
  const [scriptTab, setScriptTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const chars = scriptTab === 'hiragana' ? HIRAGANA_CHARS : KATAKANA_CHARS;
  const [selectedChar, setSelectedChar] = useState<KanaChar>(HIRAGANA_CHARS[0]);

  const handleTabChange = (nextTab: 'hiragana' | 'katakana') => {
    playSoundEffect('tap', soundEnabled);
    setScriptTab(nextTab);
    setSelectedChar(nextTab === 'hiragana' ? HIRAGANA_CHARS[0] : KATAKANA_CHARS[0]);
  };

  const handleSelectChar = (item: KanaChar) => {
    setSelectedChar(item);
    playSoundEffect('tap', soundEnabled);
    speakJapanese(item.char, soundEnabled, 0.92);
  };

  const rows = Array.from(new Set(chars.map((c) => c.row)));

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold text-[#46A302]">
            Interactive Reference · 46 Characters Each
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
            Kana Sound Chart
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Tap any character to hear its Japanese pronunciation and inspect its memory cue.
          </p>
        </div>

        <div
          className="inline-flex items-center p-1 bg-stone-100 border-2 border-stone-200 rounded-2xl self-start"
          role="tablist"
          aria-label="Kana script selector"
        >
          <button
            type="button"
            role="tab"
            aria-selected={scriptTab === 'hiragana'}
            onClick={() => handleTabChange('hiragana')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              scriptTab === 'hiragana'
                ? 'bg-[#1CB0F6] text-white border-b-2 border-[#1899D6]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Hiragana (あ)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scriptTab === 'katakana'}
            onClick={() => handleTabChange('katakana')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              scriptTab === 'katakana'
                ? 'bg-[#1CB0F6] text-white border-b-2 border-[#1899D6]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Katakana (ア)
          </button>
        </div>
      </div>

      {/* Selected Character Inspector */}
      <section
        aria-label="Selected character details"
        className="rounded-3xl bg-white border-2 border-stone-200 border-b-4 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
      >
        <div className="shrink-0 w-24 h-24 rounded-2xl bg-[#E9FCD8] border-2 border-[#58CC02] border-b-4 flex flex-col items-center justify-center">
          <span className="font-jp text-5xl font-bold text-stone-900">{selectedChar.char}</span>
          <span className="text-xs font-extrabold text-[#2B6600] mt-1 font-mono">
            {selectedChar.romaji}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-500">
                {selectedChar.script === 'hiragana' ? 'Hiragana' : 'Katakana'} · {selectedChar.row}
              </p>
              <h2 className="text-lg font-extrabold text-stone-900">
                Sound: &ldquo;{selectedChar.romaji}&rdquo;
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  speakJapanese(selectedChar.char, soundEnabled, 0.92);
                }}
                className="tactile-btn duo-btn-blue inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                Listen
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  speakJapanese(selectedChar.char, soundEnabled, 0.55);
                }}
                aria-label={`Play slow pronunciation for ${selectedChar.romaji}`}
                title="Play slowly"
                className="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-50 text-[#1899D6] border-2 border-[#BAE6FD] border-b-4 hover:bg-sky-100 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <TurtleIcon className="w-4 h-4" />
                Slow
              </button>
            </div>
          </div>

          <p className="text-sm text-stone-700">{selectedChar.mnemonic}</p>
          <p className="text-xs text-stone-500">
            Example:{' '}
            <span className="font-jp font-bold text-stone-800">{selectedChar.exampleWord.kana}</span>
            {showRomaji && <span> ({selectedChar.exampleWord.romaji})</span>} —{' '}
            <span>{selectedChar.exampleWord.meaning}</span>
          </p>
        </div>
      </section>

      {/* Kana Grid Grouped by Row */}
      <div className="space-y-5">
        {rows.map((rowName) => {
          const rowItems = chars.filter((c) => c.row === rowName);
          return (
            <div key={rowName} className="space-y-2">
              <h3 className="text-xs font-extrabold text-stone-500">{rowName}</h3>
              <div className="grid grid-cols-5 gap-2.5">
                {rowItems.map((item) => {
                  const isSelected = selectedChar.id === item.id;
                  const level = mastery[item.id]?.masteryLevel ?? 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectChar(item)}
                      aria-pressed={isSelected}
                      aria-label={`${item.char}, read ${item.romaji}`}
                      className={`tactile-btn rounded-2xl p-3 border-2 border-b-4 text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                        isSelected
                          ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-stone-900'
                          : 'bg-white border-stone-200 border-b-stone-300 hover:bg-stone-50 text-stone-900'
                      }`}
                    >
                      <span className="font-jp text-2xl sm:text-3xl font-bold">{item.char}</span>
                      {showRomaji && (
                        <span className="text-xs font-bold text-stone-500 font-mono">
                          {item.romaji}
                        </span>
                      )}
                      <div className="w-8 h-1.5 rounded-full bg-stone-100 overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#58CC02] rounded-full"
                          style={{ width: `${Math.min(100, level * 20)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
