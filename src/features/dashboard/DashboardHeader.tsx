import { Typewriter } from "react-simple-typewriter";
import { ChevronsDownIcon } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="h-screen flex justify-center items-center relative overflow-hidden">
      {/* Radial gradient glow in top right - animated light traveling */}
      <div
        className="absolute top-0 right-0 w-[1000px] h-[1000px] pointer-events-none gradient-move"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(99, 102, 241, 0.4) 20%, rgba(99, 102, 241, 0.2) 40%, transparent 70%)",
        }}
      />

      {/* Animated Radar/Sonar Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[600px] h-[600px]">
          {/* Animated radar waves */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/40"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                animation: `radar-pulse 3s ease-out infinite`,
                animationDelay: `${i * 0.75}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes radar-pulse {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.7;
          }
        }
        
        @keyframes gradient-move {
          0% {
            transform: translate(50%, -50%) translate(-100px, 100px);
            opacity: 0.5;
          }
          25% {
            transform: translate(50%, -50%) translate(-50px, -50px);
            opacity: 0.8;
          }
          50% {
            transform: translate(50%, -50%) translate(50px, -100px);
            opacity: 0.7;
          }
          75% {
            transform: translate(50%, -50%) translate(100px, 50px);
            opacity: 0.6;
          }
          100% {
            transform: translate(50%, -50%) translate(-100px, 100px);
            opacity: 0.5;
          }
        }
        
        .animate-bounce {
          animation: bounce 1.5s ease-in-out infinite;
        }
        
        .gradient-move {
          animation: gradient-move 12s ease-in-out infinite;
        }
      `}</style>

      <div className="my-5 mb-20 relative z-10">
        <h2 className="text-5xl sm:text-6xl tracking-tight md:text-7xl text-center h-24 sm:h-20 font-mono font-bold">
          <Typewriter
            words={["See Every Signal", "Trade with Vision"]}
            loop={1}
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h2>
        <p className="text-muted-foreground text-sm sm:text-xl leading-7 md:text-2xl not-first:mt-6 text-center">
          Real-time pattern detection and alerts for serious crypto traders
        </p>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute bottom-1/12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-0 pointer-events-none">
        <ChevronsDownIcon
          className="w-8 h-8 text-muted-foreground animate-bounce"
          style={{ animationDelay: "0s" }}
        />
      </div>
    </div>
  );
}
