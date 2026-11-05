import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  baseSize: number;
  currentX: number;
  currentY: number;
  currentSize: number;
}

export const DotBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mouse state
  const mouse = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const SPACING = 40;
  const LENS_RADIUS = 250;
  // Decreased displacement so atoms don't spread too much
  const MAX_DISPLACEMENT = 25;
  const DOT_COLOR = "rgba(255, 255, 255, 0.8)";
  const LINE_COLOR = "rgba(255, 255, 255, 0.15)"; // Soft grid lines

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: Dot[] = [];
    let cols = 0;
    let rows = 0;
    let animationFrameId = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let inView = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots = [];
      cols = Math.floor(canvas.width / SPACING) + 2;
      rows = Math.floor(canvas.height / SPACING) + 2;
      
      const offsetX = (canvas.width - (cols - 1) * SPACING) / 2;
      const offsetY = (canvas.height - (rows - 1) * SPACING) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            baseX: offsetX + i * SPACING,
            baseY: offsetY + j * SPACING,
            x: offsetX + i * SPACING,
            y: offsetY + j * SPACING,
            baseSize: 1.5,
            size: 1.5,
            currentX: 0,
            currentY: 0,
            currentSize: 0,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.targetX = e.clientX - rect.left;
      mouse.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.targetX = -1000;
      mouse.current.targetY = -1000;
    };

    const onResize = () => {
      resize();
      // Redraw once when the loop is idle (reduced motion or off screen); a running loop already redraws.
      if (!animationFrameId) animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", onResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    resize(); // Initial setup

    const render = () => {
      // Smoothly interpolate mouse position (lerp)
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.1;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Calculate all positions first
      for (const dot of dots) {
        const dx = dot.baseX - mouse.current.x;
        const dy = dot.baseY - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        dot.currentSize = dot.baseSize;
        dot.currentX = dot.baseX;
        dot.currentY = dot.baseY;

        if (dist < LENS_RADIUS) {
          // Calculate repulsion force (stronger closer to center)
          // Using a smooth curve (sine or ease-in-out)
          const force = 1 - dist / LENS_RADIUS;
          const smoothForce = force * force * (3 - 2 * force); // smoothstep
          
          // Displace outward
          const angle = Math.atan2(dy, dx);
          const displacement = smoothForce * MAX_DISPLACEMENT;
          
          dot.currentX += Math.cos(angle) * displacement;
          dot.currentY += Math.sin(angle) * displacement;

          // Scale up the dot size slightly less for a tighter look
          dot.currentSize += smoothForce * 2; 
        }
      }

      // 2. Draw lines connecting the grid
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j;
          const dot = dots[index];
          
          // Connect to the dot on the right
          if (i < cols - 1) {
            const rightIndex = (i + 1) * rows + j;
            const rightDot = dots[rightIndex];
            ctx.moveTo(dot.currentX, dot.currentY);
            ctx.lineTo(rightDot.currentX, rightDot.currentY);
          }
          
          // Connect to the dot below
          if (j < rows - 1) {
            const bottomIndex = i * rows + (j + 1);
            const bottomDot = dots[bottomIndex];
            ctx.moveTo(dot.currentX, dot.currentY);
            ctx.lineTo(bottomDot.currentX, bottomDot.currentY);
          }
        }
      }
      ctx.stroke();

      // 3. Draw dots (atoms) at the intersections
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.currentX, dot.currentY, dot.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = DOT_COLOR;
        ctx.fill();
      }

      animationFrameId = shouldRun() ? requestAnimationFrame(render) : 0;
    };

    // Animate only while the canvas is on screen, the tab is visible, and motion is not reduced.
    // Under reduced motion the first render draws one static frame and stops.
    const shouldRun = () => inView && !document.hidden && !reducedMotion;
    const resumeIfNeeded = () => {
      if (!animationFrameId && shouldRun()) animationFrameId = requestAnimationFrame(render);
    };
    const onVisibility = () => resumeIfNeeded();
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      resumeIfNeeded();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resumeIfNeeded();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    render();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
      style={{ display: "block" }}
    />
  );
};
