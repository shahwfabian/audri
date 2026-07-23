/** Audri's primary mark, matching the white triangle used in the favicon. */
export function AudriLogo({ size = 32, className }: { size?: number; className?: string }) {
 return (
  <svg
   width={size}
   height={size}
   viewBox="0 0 64 64"
   fill="none"
   xmlns="http://www.w3.org/2000/svg"
   className={className}
   role="img"
   aria-label="Audri"
  >
   <path d="M32 7L58 55H6L32 7Z" fill="var(--text, #F5F5F5)" />
   <path d="M32 7L58 55H32V7Z" fill="#BDBDBD" opacity="0.28" />
   <path d="M32 7L32 55H6L32 7Z" fill="#FFFFFF" opacity="0.08" />
  </svg>
 );
}
