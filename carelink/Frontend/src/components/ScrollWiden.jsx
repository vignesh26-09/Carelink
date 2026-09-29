import { useEffect, useRef, useState } from "react";

// A small scroll-in/widen treatment for the landing-page story.
// It respects reduced-motion preferences and has no external dependency.
export default function ScrollWiden({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`scroll-widen ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}
