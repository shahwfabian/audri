/**
 * The Audri mark, calligraphic gold "A" with a four-point star and laurel leaves.
 * Scales crisply anywhere; inherits the gold palette from CSS variables.
 */
export function AudriLogo({ size = 32, className }: { size?: number; className?: string }) {
 return (
 <svg
 width={size}
 height={size}
 viewBox="0 0 64 64"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 className={className}
 aria-label="Audri"
 >
 <defs>
 <linearGradient id="audri-gold" x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
 <stop offset="0" stopColor="var(--gold-dark, #8E8E8E)" />
 <stop offset="0.5" stopColor="var(--gold, #F0F0F0)" />
 <stop offset="1" stopColor="var(--gold-light, #FFFFFF)" />
 </linearGradient>
 </defs>

 {/* Four-point star */}
 <path
 d="M17 4 Q18.4 11.2 24 12.8 Q18.4 14.4 17 21.6 Q15.6 14.4 10 12.8 Q15.6 11.2 17 4 Z"
 fill="var(--gold-bright, #FFFFFF)"
 />

 {/* Leaves sprouting from the crown of the A */}
 <path
 d="M45 15 Q50.5 6.5 58 8.5 Q55.5 17 45 15 Z"
 fill="url(#audri-gold)"
 />
 <path
 d="M44 19.5 Q51 16 56.5 19.5 Q50.5 25 44 19.5 Z"
 fill="url(#audri-gold)"
 opacity="0.85"
 />

 {/* Calligraphic A */}
 <text
 x="30"
 y="55"
 textAnchor="middle"
 fontFamily="Georgia, 'Playfair Display', 'Times New Roman', serif"
 fontStyle="italic"
 fontWeight="700"
 fontSize="52"
 fill="url(#audri-gold)"
 >
 A
 </text>
 </svg>
 );
}
