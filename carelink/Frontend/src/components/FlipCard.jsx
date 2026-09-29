import { useState } from "react";

// CSS/JS adaptation of the requested FlipCard component. It flips on click
// and keyboard focus, while preserving a usable action on the back.
export default function FlipCard({ front, back, label }) {
  const [flipped, setFlipped] = useState(false);
  return <article className={`flip-card ${flipped ? "is-flipped" : ""}`}>
    <div className="flip-card-inner">
      <div className="flip-card-face flip-card-front" aria-hidden={flipped}>{front}<button className="card-flip-toggle" tabIndex={flipped ? -1 : 0} aria-label={`Learn more about ${label}`} onClick={() => setFlipped(true)}>About this specialist <span>↗</span></button></div>
      <div className="flip-card-face flip-card-back" aria-hidden={!flipped}>{back}<button className="card-flip-toggle" tabIndex={flipped ? 0 : -1} onClick={() => setFlipped(false)}>Back to profile <span>↩</span></button></div>
    </div>
  </article>;
}
