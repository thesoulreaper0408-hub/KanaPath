export type MascotMood = 'idle' | 'happy' | 'encouraging' | 'combo' | 'celebrating';

interface SenseiMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP: Record<NonNullable<SenseiMascotProps['size']>, string> = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

/**
 * Animated Shiba Inu Sensei SVG mascot with dynamic expressions:
 * idle (breathing), happy/cheering (correct), encouraging/sad (wrong),
 * combo (starry-eyed streak), and celebrating (lesson complete).
 */
export function SenseiMascot({ mood = 'idle', size = 'md', className = '' }: SenseiMascotProps) {
  const animClass =
    mood === 'happy' || mood === 'celebrating' || mood === 'combo'
      ? 'animate-mascot-cheer'
      : mood === 'encouraging'
      ? 'animate-mascot-encourage'
      : 'animate-mascot-idle';

  const isCheering = mood === 'happy' || mood === 'celebrating' || mood === 'combo';
  const isSad = mood === 'encouraging';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${SIZE_MAP[size]} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible ${animClass}`}
      >
        {/* Celebratory sparkles / sakura petals */}
        {(mood === 'celebrating' || mood === 'combo') && (
          <g>
            <path
              d="M16 22L18.5 16L21 22L27 24.5L21 27L18.5 33L16 27L10 24.5L16 22Z"
              fill="#FFC800"
            />
            <path
              d="M99 16L101 11L103 16L108 18L103 20L101 25L99 20L94 18L99 16Z"
              fill="#FFC800"
            />
            <circle cx="14" cy="48" r="3.5" fill="#FF9CE3" />
            <circle cx="107" cy="44" r="3" fill="#58CC02" />
          </g>
        )}

        {/* Curled Shiba Tail */}
        <path
          d="M84 86C99 84 106 72 101 61C97 53 88 55 86 63"
          stroke="#6B3710"
          strokeWidth="4"
          strokeLinecap="round"
          fill="#F59E3F"
        />

        {/* Body */}
        <rect
          x="33"
          y="70"
          width="54"
          height="38"
          rx="22"
          fill="#F59E3F"
          stroke="#6B3710"
          strokeWidth="3.5"
        />
        {/* White belly */}
        <ellipse cx="60" cy="91" rx="16" ry="14" fill="#FFFDF9" />

        {/* Left & Right Paws (raised when cheering/celebrating) */}
        {isCheering ? (
          <>
            <path
              d="M36 78L20 56"
              stroke="#F59E3F"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M36 78L20 56"
              stroke="#6B3710"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="19" cy="54" r="6.5" fill="#FFFDF9" stroke="#6B3710" strokeWidth="3" />

            <path
              d="M84 78L100 56"
              stroke="#F59E3F"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M84 78L100 56"
              stroke="#6B3710"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="101" cy="54" r="6.5" fill="#FFFDF9" stroke="#6B3710" strokeWidth="3" />
          </>
        ) : (
          <>
            <ellipse cx="42" cy="104" rx="8" ry="6" fill="#FFFDF9" stroke="#6B3710" strokeWidth="3" />
            <ellipse cx="78" cy="104" rx="8" ry="6" fill="#FFFDF9" stroke="#6B3710" strokeWidth="3" />
          </>
        )}

        {/* Signature Green Sensei Scarf */}
        <path
          d="M35 72C45 80 75 80 85 72C87 79 83 84 74 86H46C37 84 33 79 35 72Z"
          fill="#58CC02"
          stroke="#3E8E00"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M64 81L72 95L80 91L73 79Z"
          fill="#46A302"
          stroke="#3E8E00"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Ears (droop slightly when encouraging/sad) */}
        <g transform={isSad ? 'translate(0 4)' : undefined}>
          <path
            d={isSad ? 'M30 42L20 26L46 31Z' : 'M31 41L28 16L50 30Z'}
            fill="#F59E3F"
            stroke="#6B3710"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d={isSad ? 'M32 39L26 29L43 32Z' : 'M34 38L32 23L45 31Z'}
            fill="#FFF0DB"
          />
          <path
            d={isSad ? 'M90 42L100 26L74 31Z' : 'M89 41L92 16L70 30Z'}
            fill="#F59E3F"
            stroke="#6B3710"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d={isSad ? 'M88 39L94 29L77 32Z' : 'M86 38L88 23L75 31Z'}
            fill="#FFF0DB"
          />
        </g>

        {/* Head */}
        <ellipse
          cx="60"
          cy="52"
          rx="32"
          ry="26"
          fill="#F59E3F"
          stroke="#6B3710"
          strokeWidth="3.5"
        />

        {/* Cream Shiba Cheeks / Mask */}
        <path
          d="M31 54C33 43 45 45 53 52C57 55 63 55 67 52C75 45 87 43 89 54C90 67 77 76 60 76C43 76 30 67 31 54Z"
          fill="#FFFDF9"
        />

        {/* Shiba Eyebrow Dots */}
        <ellipse
          cx="47"
          cy="39"
          rx="4"
          ry="2.5"
          transform={isSad ? 'rotate(-16 47 39)' : 'rotate(8 47 39)'}
          fill="#FFFDF9"
        />
        <ellipse
          cx="73"
          cy="39"
          rx="4"
          ry="2.5"
          transform={isSad ? 'rotate(16 73 39)' : 'rotate(-8 73 39)'}
          fill="#FFFDF9"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="38" cy="59" rx="5" ry="3.2" fill="#FF8DA1" opacity={isSad ? 0.45 : 0.8} />
        <ellipse cx="82" cy="59" rx="5" ry="3.2" fill="#FF8DA1" opacity={isSad ? 0.45 : 0.8} />

        {/* Eyes based on mood */}
        {mood === 'happy' || mood === 'celebrating' ? (
          <>
            <path
              d="M42 52C44 47 50 47 52 52"
              stroke="#43230C"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <path
              d="M68 52C70 47 76 47 78 52"
              stroke="#43230C"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'combo' ? (
          <>
            <path
              d="M47 45L48.8 49.2L53 51L48.8 52.8L47 57L45.2 52.8L41 51L45.2 49.2L47 45Z"
              fill="#FFC800"
              stroke="#6B3710"
              strokeWidth="1.5"
            />
            <path
              d="M73 45L74.8 49.2L79 51L74.8 52.8L73 57L71.2 52.8L67 51L71.2 49.2L73 45Z"
              fill="#FFC800"
              stroke="#6B3710"
              strokeWidth="1.5"
            />
          </>
        ) : (
          <>
            <circle cx="47" cy="51" r="4.2" fill="#43230C" />
            <circle cx="45.5" cy="49.5" r="1.5" fill="#FFFFFF" />
            <circle cx="73" cy="51" r="4.2" fill="#43230C" />
            <circle cx="71.5" cy="49.5" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {/* Round Sensei Glasses */}
        <circle cx="47" cy="51" r="9.5" stroke="#7C4A24" strokeWidth="2.6" fill="none" />
        <circle cx="73" cy="51" r="9.5" stroke="#7C4A24" strokeWidth="2.6" fill="none" />
        <path d="M56.5 51H63.5" stroke="#7C4A24" strokeWidth="2.6" strokeLinecap="round" />

        {/* Nose */}
        <ellipse cx="60" cy="58" rx="4.2" ry="3" fill="#43230C" />

        {/* Mouth based on mood */}
        {isSad ? (
          <path
            d="M54 67C57 64 63 64 66 67"
            stroke="#43230C"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        ) : isCheering ? (
          <>
            <path
              d="M52 63C55 70 65 70 68 63Z"
              fill="#FF6B81"
              stroke="#43230C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M52 63C55 65 58 64 60 61C62 64 65 65 68 63"
              stroke="#43230C"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <path
            d="M53 63C55.5 66 58.5 65.5 60 62.5C61.5 65.5 64.5 66 67 63"
            stroke="#43230C"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Encouraging sweat drop when wrong */}
        {isSad && (
          <path
            d="M93 36C93 36 98 42 98 45.5C98 48.2 95.8 50.5 93 50.5C90.2 50.5 88 48.2 88 45.5C88 42 93 36 93 36Z"
            fill="#1CB0F6"
          />
        )}
      </svg>
    </div>
  );
}
