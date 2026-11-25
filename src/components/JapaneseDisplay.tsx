import { Volume2 } from 'lucide-react';
import type { JapaneseText, ScriptMode } from '../types/learning';
import { playSoundEffect, speakJapanese } from '../utils/sound';

export function TurtleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Turtle shell */}
      <path d="M5 14a7 7 0 0 1 13.4-2.5" />
      <path d="M4 14h15" />
      {/* Shell segments */}
      <path d="M9.5 7.5 10.5 14" />
      <path d="M14.5 7.8 13.8 14" />
      {/* Head */}
      <circle cx="20.2" cy="12.2" r="1.8" />
      {/* Legs */}
      <path d="M7 14v3.2" />
      <path d="M16 14v3.2" />
      {/* Tiny tail */}
      <path d="M4 14 2.5 15" />
    </svg>
  );
}

interface JapaneseDisplayProps {
  jp: JapaneseText;
  scriptMode: ScriptMode;
  showRomaji: boolean;
  soundEnabled?: boolean;
  showSpeaker?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center';
  inline?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<JapaneseDisplayProps['size']>, string> = {
  sm: 'text-base leading-snug',
  md: 'text-xl leading-snug',
  lg: 'text-2xl sm:text-3xl leading-snug',
  xl: 'text-4xl sm:text-5xl leading-tight',
};

export function JapaneseDisplay({
  jp,
  scriptMode,
  showRomaji,
  soundEnabled = true,
  showSpeaker = false,
  size = 'md',
  align = 'left',
  inline = false,
}: JapaneseDisplayProps) {
  const renderScript = () => {
    if (scriptMode === 'kana') {
      return <span>{jp.kana}</span>;
    }

    if (scriptMode === 'furigana' && jp.segments && jp.segments.length > 0) {
      return (
        <span>
          {jp.segments.map((seg, idx) =>
            seg.furigana ? (
              <ruby key={`${seg.text}-${idx}`}>
                {seg.text}
                <rp>(</rp>
                <rt>{seg.furigana}</rt>
                <rp>)</rp>
              </ruby>
            ) : (
              <span key={`${seg.text}-${idx}`}>{seg.text}</span>
            )
          )}
        </span>
      );
    }

    if (scriptMode === 'kanji' && jp.kanji) {
      return <span>{jp.kanji}</span>;
    }

    return <span>{jp.kana}</span>;
  };

  if (inline) {
    return (
      <span className="inline-flex flex-col items-center align-middle">
        <span className={`font-jp font-bold text-stone-900 ${SIZE_CLASSES[size]}`}>
          {renderScript()}
        </span>
        {showRomaji && jp.romaji && (
          <span className="text-xs font-semibold text-stone-500 mt-0.5">{jp.romaji}</span>
        )}
      </span>
    );
  }

  const spokenText = jp.tts || jp.kanji || jp.kana;

  const handleSpeak = (e: React.MouseEvent, slow = false) => {
    e.stopPropagation();
    playSoundEffect('tap', soundEnabled);
    speakJapanese(spokenText, soundEnabled, slow ? 0.55 : 0.92);
  };

  return (
    <div
      className={`flex items-center gap-2.5 ${
        align === 'center' ? 'justify-center text-center' : 'justify-start text-left'
      }`}
    >
      {showSpeaker && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => handleSpeak(e, false)}
            aria-label={`Play Japanese pronunciation for ${jp.romaji || jp.kana}`}
            className="tactile-btn duo-btn-blue w-10 h-10 rounded-xl flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] cursor-pointer"
          >
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => handleSpeak(e, true)}
            aria-label={`Play slow Japanese pronunciation for ${jp.romaji || jp.kana}`}
            title="Play slowly"
            className="tactile-btn w-9 h-9 rounded-xl bg-sky-50 text-[#1899D6] border-2 border-[#BAE6FD] border-b-4 hover:bg-sky-100 active:translate-y-0.5 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] cursor-pointer"
          >
            <TurtleIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="min-w-0">
        <div className={`font-jp font-bold text-stone-900 ${SIZE_CLASSES[size]}`}>
          {renderScript()}
        </div>
        {showRomaji && jp.romaji && (
          <div className="text-xs sm:text-sm font-semibold text-stone-500 mt-0.5 tracking-wide">
            {jp.romaji}
          </div>
        )}
      </div>
    </div>
  );
}
