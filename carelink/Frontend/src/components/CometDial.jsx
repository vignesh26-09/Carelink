export default function CometDial({ value = 0, total = 3, label = "Care progress", display }) {
  const safe = Math.min(Math.max(value, 0), total || 1);
  const radius = 43, circumference = 2 * Math.PI * radius, progress = safe / (total || 1);
  return <div className="comet-dial" role="img" aria-label={`${label}: ${safe} of ${total}`}>
    <svg viewBox="0 0 112 112" aria-hidden="true"><defs><linearGradient id="comet-gradient" x1="0" x2="1"><stop stopColor="#66d7ff"/><stop offset="1" stopColor="#3267df"/></linearGradient></defs><circle className="comet-track" cx="56" cy="56" r={radius}/><circle className="comet-progress" cx="56" cy="56" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}/><circle className="comet-head" cx={56 + radius * Math.cos(-Math.PI / 2 + progress * Math.PI * 2)} cy={56 + radius * Math.sin(-Math.PI / 2 + progress * Math.PI * 2)} r="4"/></svg>
    <span><strong>{display ?? safe}</strong>{display === undefined && <> / {total}</>}</span>
  </div>;
}
