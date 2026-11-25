import { useState } from 'react';
import { Search } from 'lucide-react';
import { VOCAB_GRAMMAR_ITEMS } from '../data/curriculum';
import type { ItemMasteryRecord, ScriptMode, VocabKind } from '../types/learning';
import { JapaneseDisplay } from './JapaneseDisplay';

interface VocabLibraryViewProps {
  scriptMode: ScriptMode;
  showRomaji: boolean;
  soundEnabled: boolean;
  completedLessonIds: string[];
  mastery: Record<string, ItemMasteryRecord>;
}

const FILTERS: Array<{ value: 'all' | VocabKind; label: string }> = [
  { value: 'all', label: 'All Items' },
  { value: 'vocab', label: 'Vocabulary' },
  { value: 'katakana', label: 'Katakana' },
  { value: 'kanji', label: 'Basic Kanji' },
  { value: 'grammar', label: 'Grammar' },
];

export function VocabLibraryView({
  scriptMode,
  showRomaji,
  soundEnabled,
  completedLessonIds,
  mastery,
}: VocabLibraryViewProps) {
  const [filter, setFilter] = useState<'all' | VocabKind>('all');
  const [queryText, setQueryText] = useState('');

  const filtered = VOCAB_GRAMMAR_ITEMS.filter((item) => {
    if (filter !== 'all' && item.kind !== filter) return false;
    if (!queryText.trim()) return true;
    const q = queryText.trim().toLowerCase();
    return (
      item.meaning.toLowerCase().includes(q) ||
      item.jp.romaji.toLowerCase().includes(q) ||
      item.jp.kana.includes(q) ||
      (item.jp.kanji && item.jp.kanji.includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold text-emerald-700">
          Structured Curriculum Library · {VOCAB_GRAMMAR_ITEMS.length} Core Items
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
          Vocabulary, Kanji & Grammar
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Switch between Kana, Furigana, Kanji, and Romaji anytime to challenge your reading skills.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-stone-100 border-2 border-stone-200 rounded-2xl"
          role="group"
          aria-label="Filter items by category"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                filter === f.value
                  ? 'bg-[#1CB0F6] text-white border-b-2 border-[#1899D6]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="relative block sm:w-56">
          <span className="sr-only">Search vocabulary or grammar</span>
          <Search
            className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search English or romaji..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-2xl bg-white border-2 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#1CB0F6]"
          />
        </label>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
          <p className="text-sm font-semibold text-stone-700">No Japanese items match your filter.</p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setQueryText('');
            }}
            className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Clear search & filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 rounded-2xl bg-white border border-stone-200 overflow-hidden">
          {filtered.map((item) => {
            const unlocked = completedLessonIds.includes(item.lessonId);
            const rec = mastery[item.id];
            const masteryLevel = rec?.masteryLevel ?? 0;

            return (
              <article key={item.id} className="p-4 sm:p-5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <JapaneseDisplay
                    jp={item.jp}
                    scriptMode={scriptMode}
                    showRomaji={showRomaji}
                    soundEnabled={soundEnabled}
                    showSpeaker
                    size="md"
                  />

                  <div className="sm:text-right">
                    <p className="text-base font-bold text-stone-900">{item.meaning}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      <span className="capitalize">{item.kind}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{unlocked ? 'Practiced' : 'Upcoming'}</span>
                      {masteryLevel > 0 && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="tabular-nums text-emerald-700 font-semibold">
                            Mastery {masteryLevel}/5
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {item.note && <p className="text-sm text-stone-600 leading-relaxed">{item.note}</p>}

                {item.example && (
                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <JapaneseDisplay
                      jp={item.example.jp}
                      scriptMode={scriptMode}
                      showRomaji={showRomaji}
                      soundEnabled={soundEnabled}
                      showSpeaker
                      size="sm"
                    />
                    <span className="text-xs font-medium text-stone-500">
                      {item.example.meaning}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
