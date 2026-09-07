// The one shared "character" renderer for the Language Hacks section — a
// colored emoji badge with an optional short CSS flourish (see the five
// .mascot-anim-* keyframes in styles.css). Every mascot in the section
// (prefixes, root-family branches, aspect, motion) renders through this
// same component, so the same character always looks the same everywhere
// it reappears, instead of each screen drawing its own version.
export default function Mascot({ emoji, color, size = 40, animate = false, animation = 'pop', label }) {
  return (
    <span
      className={`mascot ${animate ? `mascot-anim-${animation}` : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.56, background: color }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {emoji}
    </span>
  );
}
