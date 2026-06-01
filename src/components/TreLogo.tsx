export function TreLogo({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tribunal Regional Eleitoral de Goiás"
    >
      <defs>
        <radialGradient id="treBlue" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#7fb8ff" />
          <stop offset="60%" stopColor="#1769c9" />
          <stop offset="100%" stopColor="#0a3a85" />
        </radialGradient>
      </defs>
      {/* Yellow triangle */}
      <polygon points="10,100 60,15 110,100" fill="#f5c518" />
      {/* Green rectangle */}
      <rect x="18" y="78" width="84" height="28" fill="#2aa84a" />
      {/* Blue sphere */}
      <circle cx="60" cy="62" r="34" fill="url(#treBlue)" stroke="#0a3a85" strokeWidth="1.2" />
      {/* Meridians */}
      <ellipse cx="60" cy="62" rx="34" ry="14" fill="none" stroke="#0a3a85" strokeWidth="0.8" opacity="0.55" />
      <ellipse cx="60" cy="62" rx="14" ry="34" fill="none" stroke="#0a3a85" strokeWidth="0.8" opacity="0.55" />
      {/* Stars */}
      {[
        [50, 48], [70, 50], [58, 60], [48, 70], [72, 72], [60, 78], [44, 58], [76, 60],
      ].map(([cx, cy], i) => (
        <Star key={i} cx={cx} cy={cy} r={2.2} />
      ))}
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r / 2.4;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return <polygon points={points.join(" ")} fill="#fff" />;
}
