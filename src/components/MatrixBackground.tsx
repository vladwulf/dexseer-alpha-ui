import { useEffect, useRef } from "react";

interface MatrixColumn {
  y: number;
  speed: number;
  chars: string[];
}

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHAR_SIZE = 12; // pixels

// Speed configuration (pixels per frame)
const SPEED_MIN = 0.1; // Minimum speed
const SPEED_MAX = 1.0; // Maximum speed

// Detect mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

// Adjust FPS based on device (lower FPS to save resources)
const getTargetFPS = () => (isMobile() ? 15 : 24);

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const columnsRef = useRef<MatrixColumn[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Set canvas size accounting for device pixel ratio (retina displays)
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Reset transform and scale context for retina displays
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      // Reduce columns on mobile for better performance
      const mobileMultiplier = isMobile() ? 0.6 : 1;
      const columnCount = Math.floor((width / CHAR_SIZE) * mobileMultiplier);
      
      columnsRef.current = Array.from({ length: columnCount }, () => ({
        y: Math.random() * -height,
        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
        chars: Array.from({ length: Math.floor(height / CHAR_SIZE) + 2 }, () =>
          CHARS[Math.floor(Math.random() * CHARS.length)]
        ),
      }));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = 0;
    let isVisible = true;
    
    // Pause animation when page is hidden (saves battery on mobile)
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = (currentTime: number) => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const targetFPS = getTargetFPS();
      if (currentTime - lastTime < 1000 / targetFPS) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      // Clear canvas (use logical dimensions, context is already scaled)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Set font
      ctx.font = `${CHAR_SIZE}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Draw columns
      columnsRef.current.forEach((column, colIndex) => {
        const x = colIndex * CHAR_SIZE;
        
        // Update column position
        column.y += column.speed;
        
        // Reset column if it goes off screen
        const canvasHeight = window.innerHeight;
        if (column.y > canvasHeight) {
          column.y = -CHAR_SIZE * column.chars.length;
          // Randomly change some characters
          column.chars = column.chars.map((_, idx) =>
            Math.random() < 0.1
              ? CHARS[Math.floor(Math.random() * CHARS.length)]
              : column.chars[idx]
          );
        }

        // Draw characters in column
        column.chars.forEach((char, charIndex) => {
          const charY = column.y + charIndex * CHAR_SIZE;
          
          // Skip if character is off screen
          if (charY < -CHAR_SIZE || charY > canvasHeight) return;

          // Calculate opacity and color
          const opacity = Math.max(0, 1 - (charIndex / column.chars.length) * 0.8);
          const isLeading = charIndex === 0;
          
          let color: string;
          if (isLeading) {
            color = "rgba(255, 255, 255, 1)";
          } else if (opacity > 0.3) {
            color = `rgba(136, 136, 136, ${opacity})`;
          } else {
            color = `rgba(0, 0, 0, ${opacity})`;
          }

          ctx.fillStyle = color;
          ctx.fillText(char, x, charY);
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}