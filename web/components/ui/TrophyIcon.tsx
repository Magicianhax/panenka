export function TrophyIcon({ size = 64, color = "var(--gold)" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <linearGradient id="trophy-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold-bright)" />
          <stop offset="100%" stopColor="var(--gold-deep)" />
        </linearGradient>
      </defs>
      <path d="M 18 8 L 46 8 L 44 32 Q 44 42 32 42 Q 20 42 20 32 Z" fill="url(#trophy-g)" stroke={color} strokeWidth="1.5" />
      <path d="M 18 12 Q 8 14 8 22 Q 8 28 18 28" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M 46 12 Q 56 14 56 22 Q 56 28 46 28" fill="none" stroke={color} strokeWidth="2.5" />
      <rect x="28" y="42" width="8" height="8" fill="url(#trophy-g)" />
      <polygon points="20,50 44,50 48,58 16,58" fill="url(#trophy-g)" stroke={color} strokeWidth="1.5" />
      <circle cx="32" cy="24" r="4" fill="white" opacity="0.4" />
    </svg>
  );
}
