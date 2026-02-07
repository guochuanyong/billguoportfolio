import { useEffect, useRef } from "react";

export default function MatrixRain({
  opacity = 0.25,
  speed = 1, // higher = faster
  fontSize = 16,
  density = 1, // 1 = normal, 2 = more columns, 0.5 = fewer
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Respect device pixel ratio for crisp text
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    let width = 0;
    let height = 0;

    // drops[i] = current "row" for column i
    let drops = [];
    let columns = 0;

    const resize = () => {
      const { innerWidth, innerHeight } = window;

      width = Math.floor(innerWidth * dpr);
      height = Math.floor(innerHeight * dpr);

      canvas.width = width;
      canvas.height = height;

      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;

      // Scale drawing to device pixels
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Decide columns based on font size and density
      const colWidth = Math.max(8, Math.floor(fontSize * dpr));
      columns = Math.floor((width / colWidth) * density);

      drops = new Array(columns).fill(0).map(() => {
        // start at random vertical positions for nicer initial look
        return Math.floor(Math.random() * (height / (fontSize * dpr)));
      });

      ctx.font = `${fontSize * dpr}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
      ctx.textBaseline = "top";
    };

    const draw = () => {
      // Fade the entire canvas slightly to create trailing effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.08})`;
      ctx.fillRect(0, 0, width, height);

      // Binary characters
      // (You can expand to include other chars if you want)
      const chars = ["0", "1"];

      // Green-ish text (leave as is, or customize)
      ctx.fillStyle = `rgba(0, 255, 100, ${opacity})`;

      const stepY = fontSize * dpr;
      const colWidth = Math.max(8, Math.floor(fontSize * dpr));

      for (let i = 0; i < columns; i++) {
        const x = i * colWidth;
        const y = drops[i] * stepY;

        const char = chars[(Math.random() * chars.length) | 0];
        ctx.fillText(char, x, y);

        // Move drop down
        drops[i] += speed;

        // Reset drop randomly after it passes bottom
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [opacity, speed, fontSize, density]);

  return (
  <canvas
    ref={canvasRef}
    className="fixed inset-0 z-10 pointer-events-none"
    aria-hidden="true"
  />
);
}
