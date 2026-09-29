import { useEffect, useRef } from "react";

// CSS/JS adaptation of the requested ParticleText interaction. It stays
// deliberately subtle so it supports readability rather than competing with it.
export default function ParticleText({ text, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dots = Array.from({ length: 28 }, (_, i) => document.createElement("i"));
    dots.forEach((dot, i) => { dot.style.setProperty("--i", i); node.append(dot); });
    return () => dots.forEach(dot => dot.remove());
  }, []);
  return <span ref={ref} className={`particle-text ${className}`} aria-label={text}>{text}</span>;
}
