import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value, duration = 1200, prefix = "", suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const numVal = typeof value === "string" ? parseFloat(value) || 0 : value || 0;
    const startVal = prevValue.current;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numVal - startVal) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = numVal;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display);

  return (
    <span className="animated-counter">
      {prefix}{formatted}{suffix}
    </span>
  );
}
