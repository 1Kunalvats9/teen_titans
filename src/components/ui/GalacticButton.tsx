import React from 'react';

enum Variant {
  FULL = "full",
  BOXY = "boxy"
}

interface GalacticButtonProps {
  text: string;
  variant: Variant;
  color?: string; // Add the color prop
}

const GalacticButton = ({ text, variant, color = 'cyan-400/90' }: GalacticButtonProps) => {
  const roundedClass = variant === Variant.BOXY ? 'rounded-lg' : 'rounded-full';
  const gradientColor = color; // Use the provided color or default to cyan-400/90

  return (
    <button
      className={`group relative ${roundedClass} p-px text-sm/6 text-zinc-400 duration-300 hover:text-zinc-100 hover:shadow-glow`}
      type="button"
    >
      <span className={`absolute inset-0 overflow-hidden ${roundedClass}`}>
        <span className={`absolute inset-0 ${roundedClass} bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      </span>
      <div className={`relative z-10 ${roundedClass} bg-zinc-950 px-4 py-1.5 ring-1 ring-white/10`}>
        {text}
      </div>
      <span className={`absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-${gradientColor}/0 via-${gradientColor} to-${gradientColor}/0 transition-opacity duration-500 group-hover:opacity-40`} />
    </button>
  )
}

export default GalacticButton;
export { Variant };