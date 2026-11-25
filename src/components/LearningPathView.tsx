import { useState } from 'react';
import { BookOpen, Check, FastForward, Lock, Play, RotateCcw, Star, Trophy, X } from 'lucide-react';
import { COURSE_SECTIONS } from '../data/curriculum';
import type { Lesson, LessonNodeStatus, ScriptMode, Unit } from '../types/learning';
import { playSoundEffect } from '../utils/sound';
import { JapaneseDisplay } from './JapaneseDisplay';
import { SenseiMascot } from './SenseiMascot';

const BANNER_IMG = '/src/assets/images/banner_japan_path_1795145730836.jpg';

interface LearningPathViewProps {
  units: Unit[];
  statuses: Record<string, LessonNodeStatus>;
  scriptMode: ScriptMode;
  showRomaji: boolean;
  soundEnabled: boolean;
  hearts: number;
  onStartLesson: (lesson: Lesson) => void;
  onRefillHearts: () => void;
}

const ACCENT_STYLES: Record<
  Unit['accent'],
  {
    banner: string;
    activeNode: string;
    activeHalo: string;
    tooltipText: string;
    guideBtn: string;
    curveStroke: string;
  }
> = {
  emerald: {
    banner: 'bg-[#58CC02] border-b-4 border-[#46A302] text-white',
    activeNode: 'bg-[#58CC02] text-white border-[#46A302] hover:bg-[#61E002]',
    activeHalo: 'ring-[#58CC02]/25',
    tooltipText: 'text-[#46A302]',
    guideBtn: 'bg-[#46A302] hover:bg-[#3D8F00] text-white border-[#357D00]',
    curveStroke: '#89E219',
  },
  sky: {
    banner: 'bg-[#1CB0F6] border-b-4 border-[#1899D6] text-white',
    activeNode: 'bg-[#1CB0F6] text-white border-[#1899D6] hover:bg-[#38BDF8]',
    activeHalo: 'ring-[#1CB0F6]/25',
    tooltipText: 'text-[#1899D6]',
    guideBtn: 'bg-[#1899D6] hover:bg-[#1382B8] text-white border-[#106D9B]',
    curveStroke: '#84D8FF',
  },
  amber: {
    banner: 'bg-[#FF9600] border-b-4 border-[#CC7800] text-white',
    activeNode: 'bg-[#FF9600] text-white border-[#CC7800] hover:bg-[#FFA624]',
    activeHalo: 'ring-[#FF9600]/25',
    tooltipText: 'text-[#CC7800]',
    guideBtn: 'bg-[#CC7800] hover:bg-[#B36900] text-white border-[#995A00]',
    curveStroke: '#FFD166',
  },
  rose: {
    banner: 'bg-[#FF4B4B] border-b-4 border-[#EA2B2B] text-white',
    activeNode: 'bg-[#FF4B4B] text-white border-[#EA2B2B] hover:bg-[#FF6363]',
    activeHalo: 'ring-[#FF4B4B]/25',
    tooltipText: 'text-[#EA2B2B]',
    guideBtn: 'bg-[#EA2B2B] hover:bg-[#D12020] text-white border-[#B81A1A]',
    curveStroke: '#FFA5A5',
  },
  indigo: {
    banner: 'bg-[#CE82FF] border-b-4 border-[#A568CC] text-white',
    activeNode: 'bg-[#CE82FF] text-white border-[#A568CC] hover:bg-[#D99BFF]',
    activeHalo: 'ring-[#CE82FF]/25',
    tooltipText: 'text-[#9333EA]',
    guideBtn: 'bg-[#A568CC] hover:bg-[#9354BD] text-white border-[#7E43A6]',
    curveStroke: '#E2B8FF',
  },
};

// S-curve horizontal offsets (in px) per lesson index inside each unit
const S_CURVE_X = [0, -64, 58, -48, 52];

export function LearningPathView({
  units,
  statuses,
  scriptMode,
  showRomaji,
  soundEnabled,
  hearts,
  onStartLesson,
  onRefillHearts,
}: LearningPathViewProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [guidebookUnit, setGuidebookUnit] = useState<Unit | null>(null);
  const [lockedNoticeId, setLockedNoticeId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'all' | 1 | 2 | 3 | 4>('all');

  const allLessons = units.flatMap((u) => u.lessons.map((l) => ({ unit: u, lesson: l })));
  const activeEntry =
    allLessons.find((entry) => statuses[entry.lesson.id] === 'active') ||
    allLessons[allLessons.length - 1];

  const completedTotal = allLessons.filter((e) => statuses[e.lesson.id] === 'completed').length;
  const visibleUnits =
    selectedSection === 'all'
      ? units
      : units.filter((u) => (u.section ?? 1) === selectedSection);

  return (
    <div className="space-y-8 pb-10">
      {/* Focused Hero Card */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-stone-200 border-b-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-7 p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-extrabold text-[#46A302]">
                Unit {activeEntry.unit.order} · {activeEntry.unit.title} · {completedTotal}/{allLessons.length} lessons completed
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 text-balance">
                {activeEntry.lesson.title}
              </h1>
              <p className="text-sm text-stone-600">{activeEntry.lesson.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {hearts > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('tap', soundEnabled);
                    onStartLesson(activeEntry.lesson);
                  }}
                  className="tactile-btn duo-btn-green inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58CC02]"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  Continue Path (+{activeEntry.lesson.xpReward} XP)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('tap', soundEnabled);
                    onRefillHearts();
                  }}
                  className="tactile-btn duo-btn-red inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Refill Hearts to Continue
                </button>
              )}

              <span className="text-xs font-semibold text-stone-500 tabular-nums">
                ~{activeEntry.lesson.estimatedMinutes} min · {activeEntry.lesson.exercises.length} exercises
              </span>
            </div>
          </div>

          <div className="md:col-span-5 relative min-h-[160px] md:min-h-full bg-emerald-50">
            {!bannerError ? (
              <img
                src={BANNER_IMG}
                alt="Mount Fuji and a vermilion torii gate along a peaceful Japanese mountain path"
                referrerPolicy="no-referrer"
                onError={() => setBannerError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E9FCD8] to-stone-100 text-[#46A302] font-jp text-2xl font-bold">
                日本語の旅
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Duolingo-Style Course Section Switcher (4 Sections · 15 Units · 60 Lessons) */}
      <section aria-label="Course sections" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
            Japanese Course Roadmap · {COURSE_SECTIONS.length} Sections · {units.length} Units ·{' '}
            {allLessons.length} Lessons
          </h2>
          {selectedSection !== 'all' && (
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap', soundEnabled);
                setSelectedSection('all');
              }}
              className="text-xs font-extrabold text-[#1899D6] hover:underline cursor-pointer whitespace-nowrap"
            >
              Show all sections
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => {
              playSoundEffect('tap', soundEnabled);
              setSelectedSection('all');
            }}
            aria-pressed={selectedSection === 'all'}
            className={`tactile-btn text-left p-3 rounded-2xl border-2 border-b-4 transition-colors cursor-pointer ${
              selectedSection === 'all'
                ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-stone-900'
                : 'bg-white border-stone-200 border-b-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1899D6]">
              Full Path
            </p>
            <p className="text-sm font-extrabold text-stone-900 mt-0.5">All Sections</p>
            <p className="text-[11px] font-semibold text-stone-500 tabular-nums mt-0.5">
              {completedTotal}/{allLessons.length} lessons
            </p>
          </button>

          {COURSE_SECTIONS.map((sec) => {
            const secUnits = units.filter((u) => (u.section ?? 1) === sec.order);
            const secLessons = secUnits.flatMap((u) => u.lessons);
            const secDone = secLessons.filter((l) => statuses[l.id] === 'completed').length;
            const isSelected = selectedSection === sec.order;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  setSelectedSection(sec.order);
                }}
                aria-pressed={isSelected}
                className={`tactile-btn text-left p-3 rounded-2xl border-2 border-b-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#E9FCD8] border-[#58CC02] border-b-[#46A302] text-stone-900'
                    : 'bg-white border-stone-200 border-b-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                  Section {sec.order}
                </p>
                <p className="text-sm font-extrabold text-stone-900 mt-0.5 truncate">
                  {sec.title}
                </p>
                <p className="text-[11px] font-semibold text-stone-500 tabular-nums mt-0.5">
                  {secDone}/{secLessons.length} · {secUnits.length} units
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Vertical Units & Winding S-Curved Stepping-Stone Path */}
      <div className="space-y-10">
        {visibleUnits.map((unit, unitIndex) => {
          const style = ACCENT_STYLES[unit.accent];
          const unitCompleted = unit.lessons.filter((l) => statuses[l.id] === 'completed').length;
          const prevUnitSection = unitIndex > 0 ? visibleUnits[unitIndex - 1].section ?? 1 : null;
          const currentSectionMeta = COURSE_SECTIONS.find(
            (s) => s.order === (unit.section ?? 1)
          );
          const showSectionHeader = currentSectionMeta && prevUnitSection !== (unit.section ?? 1);

          // Build smooth SVG S-curve points aligned with circular stepping-stone centers
          const stepY = 176;
          const svgHeight = Math.max(240, (unit.lessons.length - 1) * stepY + 110);
          const centerX = 160;
          const pathCoords = unit.lessons.map((_, idx) => ({
            x: centerX + S_CURVE_X[idx % S_CURVE_X.length],
            y: 48 + idx * stepY,
          }));
          let curveD = '';
          for (let i = 0; i < pathCoords.length - 1; i++) {
            const p0 = pathCoords[i];
            const p1 = pathCoords[i + 1];
            const midY = (p0.y + p1.y) / 2;
            curveD +=
              i === 0
                ? `M ${p0.x} ${p0.y} C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`
                : ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
          }

          return (
            <section
              key={unit.id}
              aria-labelledby={`unit-heading-${unit.id}`}
              className="space-y-6"
            >
              {/* Section Divider Banner */}
              {showSectionHeader && currentSectionMeta && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-stone-100/90 border-2 border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#46A302]">
                        Section {currentSectionMeta.order} · {currentSectionMeta.title}
                      </span>
                      <span className="text-xs font-jp font-bold text-stone-500">
                        {currentSectionMeta.japaneseTitle}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">{currentSectionMeta.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-extrabold text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-xl self-start sm:self-center whitespace-nowrap">
                    {currentSectionMeta.cefrTag}
                  </span>
                </div>
              )}

              {/* Unit Header Banner */}
              <div className={`rounded-3xl p-5 sm:p-6 ${style.banner}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                      <span>Unit {unit.order}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-jp">{unit.japaneseTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {unitCompleted}/{unit.lessons.length} complete
                      </span>
                    </div>
                    <h2
                      id={`unit-heading-${unit.id}`}
                      className="text-xl sm:text-2xl font-extrabold tracking-tight"
                    >
                      {unit.title}
                    </h2>
                    <p className="text-sm text-white/95 max-w-xl">{unit.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('tap', soundEnabled);
                      setGuidebookUnit(unit);
                    }}
                    className={`tactile-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-b-4 text-xs font-extrabold whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${style.guideBtn}`}
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    Guidebook
                  </button>
                </div>
              </div>

              {/* S-Curved Winding Path */}
              <div className="relative pt-8 pb-4 flex flex-col items-center">
                {/* Smooth S-Curve Dotted Track SVG */}
                {curveD && (
                  <svg
                    aria-hidden="true"
                    viewBox={`0 0 320 ${svgHeight}`}
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-[320px] pointer-events-none z-0"
                    style={{ height: `${svgHeight}px` }}
                    fill="none"
                  >
                    <path
                      d={curveD}
                      stroke="#E5E5E5"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d={curveD}
                      stroke={style.curveStroke}
                      strokeWidth="4"
                      strokeDasharray="10 12"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  </svg>
                )}

                <div className="relative z-10 flex flex-col items-center gap-12 w-full">
                  {unit.lessons.map((lesson, idx) => {
                    const status = statuses[lesson.id] || 'locked';
                    const offsetPx = S_CURVE_X[idx % S_CURVE_X.length];
                    const isExpanded = selectedLessonId === lesson.id;
                    const isLockedNotice = lockedNoticeId === lesson.id;

                    const handleNodeClick = () => {
                      playSoundEffect('tap', soundEnabled);
                      if (status === 'locked') {
                        setSelectedLessonId(null);
                        setLockedNoticeId(isLockedNotice ? null : lesson.id);
                        return;
                      }
                      setLockedNoticeId(null);
                      setSelectedLessonId(isExpanded ? null : lesson.id);
                    };

                    return (
                      <div
                        key={lesson.id}
                        className="relative flex flex-col items-center w-full max-w-md"
                      >
                        <div
                          className="relative flex items-center justify-center"
                          style={{ transform: `translateX(${offsetPx}px)` }}
                        >
                          {/* Floating "START" Speech-Bubble Tooltip */}
                          {status === 'active' && (
                            <div
                              aria-hidden="true"
                              className="animate-float-gentle absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                            >
                              <div
                                className={`relative px-3.5 py-1.5 rounded-xl bg-white border-2 border-stone-200 border-b-4 font-extrabold text-xs tracking-wider uppercase shadow-xs whitespace-nowrap ${style.tooltipText}`}
                              >
                                START
                                <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-stone-200 rotate-45" />
                              </div>
                            </div>
                          )}

                          {/* Circular 3D Stepping-Stone Node */}
                          <button
                            type="button"
                            onClick={handleNodeClick}
                            aria-expanded={isExpanded || isLockedNotice}
                            aria-label={`Lesson ${unit.order}.${lesson.order}: ${lesson.title} (${status})`}
                            className={`tactile-btn relative w-[78px] h-[78px] rounded-full border-b-[6px] active:border-b-2 flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#58CC02] ${
                              status === 'completed'
                                ? 'bg-[#FFC800] text-amber-950 border-[#E5A400] hover:bg-[#FFD426]'
                                : status === 'active'
                                ? `${style.activeNode} ring-[10px] ${style.activeHalo}`
                                : 'bg-[#E5E5E5] text-stone-500 border-[#C8C8C8] hover:bg-[#DFDFDF]'
                            }`}
                          >
                            {/* Subtle glossy top arc */}
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute top-1.5 left-3.5 right-3.5 h-2.5 rounded-full bg-white/30"
                            />
                            {status === 'completed' && (
                              <Check className="w-8 h-8 stroke-[3.2]" aria-hidden="true" />
                            )}
                            {status === 'active' &&
                              (idx === unit.lessons.length - 1 ? (
                                <Trophy className="w-8 h-8" aria-hidden="true" />
                              ) : (
                                <Star className="w-8 h-8 fill-current" aria-hidden="true" />
                              ))}
                            {status === 'locked' && (
                              <Lock className="w-7 h-7" aria-hidden="true" />
                            )}
                          </button>

                          {/* Animated Shiba Sensei SVG Mascot alongside active node */}
                          {status === 'active' && (
                            <div
                              className={`hidden sm:flex items-center absolute top-1/2 -translate-y-1/2 ${
                                offsetPx < 0 ? 'left-28' : 'right-28'
                              }`}
                            >
                              <SenseiMascot mood="idle" size="md" />
                            </div>
                          )}
                        </div>

                        {/* Lesson Caption with clean page-matched backdrop so S-curve passes cleanly behind */}
                        <div
                          className="mt-2.5 px-3 py-1 rounded-xl bg-[#FAFAF8]/95 text-center"
                          style={{ transform: `translateX(${offsetPx}px)` }}
                        >
                          <p className="text-sm font-extrabold text-stone-900">{lesson.title}</p>
                          <p className="text-xs font-semibold text-stone-500">
                            {status === 'completed'
                              ? 'Completed'
                              : status === 'active'
                              ? `Up next · +${lesson.xpReward} XP`
                              : 'Locked'}
                          </p>
                        </div>

                        {/* Expanded Chunky Action Popover */}
                        {isExpanded && status !== 'locked' && (
                          <div className="mt-3 w-full max-w-xs rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-4 text-left space-y-3">
                            <div>
                              <h3 className="text-sm font-extrabold text-stone-900">
                                {lesson.title}
                              </h3>
                              <p className="text-xs text-stone-600 mt-0.5">{lesson.subtitle}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 tabular-nums">
                              <span>{lesson.exercises.length} exercises</span>
                              <span>
                                +
                                {status === 'completed'
                                  ? Math.max(10, Math.round(lesson.xpReward * 0.5))
                                  : lesson.xpReward}{' '}
                                XP
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                playSoundEffect('tap', soundEnabled);
                                onStartLesson(lesson);
                              }}
                              className="tactile-btn duo-btn-green w-full py-2.5 px-4 rounded-2xl font-extrabold text-sm cursor-pointer"
                            >
                              {status === 'completed' ? 'Practice Again' : 'Start Lesson'}
                            </button>
                          </div>
                        )}

                        {/* Locked Lesson Notice + Duolingo-Style Jump Here Option */}
                        {isLockedNotice && status === 'locked' && (
                          <div className="mt-3 w-full max-w-xs rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-4 text-center space-y-3">
                            <div>
                              <p className="text-sm font-extrabold text-stone-900">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-stone-600 mt-1">
                                Complete earlier stepping stones to unlock sequentially, or jump
                                straight in to practice now.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                playSoundEffect('tap', soundEnabled);
                                onStartLesson(lesson);
                              }}
                              className="tactile-btn duo-btn-blue w-full py-2.5 px-4 rounded-2xl font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <FastForward className="w-4 h-4" aria-hidden="true" />
                              Jump Here &amp; Practice (+{lesson.xpReward} XP)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Unit Guidebook Modal */}
      {guidebookUnit && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guidebook-title"
          className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
          onClick={() => setGuidebookUnit(null)}
        >
          <div
            className="bg-white rounded-3xl border-2 border-stone-200 border-b-4 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-[#46A302]">
                  Unit {guidebookUnit.order} Guidebook · {guidebookUnit.japaneseTitle}
                </p>
                <h2 id="guidebook-title" className="text-xl font-extrabold text-stone-900 mt-0.5">
                  {guidebookUnit.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setGuidebookUnit(null)}
                aria-label="Close guidebook"
                className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              {guidebookUnit.guidebookTips.map((tip) => (
                <div
                  key={tip.heading}
                  className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200/80 space-y-2.5"
                >
                  <h3 className="text-sm font-extrabold text-stone-900">{tip.heading}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{tip.body}</p>
                  {tip.exampleJp && (
                    <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between gap-3">
                      <JapaneseDisplay
                        jp={tip.exampleJp}
                        scriptMode={scriptMode}
                        showRomaji={showRomaji}
                        soundEnabled={soundEnabled}
                        showSpeaker
                        size="sm"
                      />
                      {tip.exampleMeaning && (
                        <span className="text-xs font-bold text-stone-600 text-right">
                          {tip.exampleMeaning}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap', soundEnabled);
                setGuidebookUnit(null);
              }}
              className="tactile-btn duo-btn-blue w-full py-3 px-4 rounded-2xl font-extrabold text-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
