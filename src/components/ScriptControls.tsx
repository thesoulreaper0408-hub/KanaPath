import { Volume2, VolumeX } from 'lucide-react';
import type { ScriptMode } from '../types/learning';
import { playSoundEffect } from '../utils/sound';

interface ScriptControlsProps {
  scriptMode: ScriptMode;
  showRomaji: boolean;
  soundEnabled: boolean;
  onChangeScriptMode: (mode: ScriptMode) => void;
  onToggleRomaji: () => void;
  onToggleSound: () => void;
  compact?: boolean;
  showSoundToggle?: boolean;
}

const SCRIPT_OPTIONS: Array<{ value: ScriptMode; label: string }> = [
  { value: 'kana', label: 'Kana' },
  { value: 'furigana', label: 'Furigana' },
  { value: 'kanji', label: 'Kanji' },
];

export function ScriptControls({
  scriptMode,
  showRomaji,
  soundEnabled,
  onChangeScriptMode,
  onToggleRomaji,
  onToggleSound,
  compact = false,
  showSoundToggle = true,
}: ScriptControlsProps) {
  return (
    <div
      className={`flex flex-wrap items-center ${compact ? 'gap-2' : 'gap-2.5'}`}
      role="group"
      aria-label="Japanese script display settings"
    >
      <div
        className="inline-flex items-center p-1 bg-stone-100 border-2 border-stone-200 rounded-2xl"
        role="group"
        aria-label="Script reading level"
      >
        {SCRIPT_OPTIONS.map((opt) => {
          const active = scriptMode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                playSoundEffect('tap', soundEnabled);
                onChangeScriptMode(opt.value);
              }}
              aria-pressed={active}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                active
                  ? 'bg-[#1CB0F6] text-white border-b-2 border-[#1899D6]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          playSoundEffect('tap', soundEnabled);
          onToggleRomaji();
        }}
        aria-pressed={showRomaji}
        className={`tactile-btn px-3.5 py-1.5 text-xs font-extrabold rounded-2xl border-2 border-b-4 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58CC02] ${
          showRomaji
            ? 'bg-[#E9FCD8] border-[#58CC02] border-b-[#46A302] text-[#2F6F00]'
            : 'bg-white border-stone-200 border-b-stone-300 text-stone-600 hover:text-stone-900'
        }`}
      >
        Romaji: {showRomaji ? 'On' : 'Off'}
      </button>

      {showSoundToggle && (
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          className={`hidden lg:inline-flex tactile-btn p-2 rounded-2xl border-2 border-b-4 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
            soundEnabled
              ? 'bg-sky-50 border-[#84D8FF] border-b-[#1CB0F6] text-[#1899D6] hover:bg-sky-100'
              : 'bg-stone-100 border-stone-200 border-b-stone-300 text-stone-400 hover:text-stone-600'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
