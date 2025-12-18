import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { active, progress } = useProgress();
  const [percentage, setPercentage] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      // Reset and show when loading starts
      setPercentage(0);
      setVisible(true);
    } else {
      // When loading finishes, force 100% and wait before hiding
      setPercentage(100);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  useEffect(() => {
    if (active) {
      setPercentage((prev) => Math.max(prev, progress));
    }
  }, [progress, active]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full max-w-xs space-y-4 p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Loading assets...</span>
          <span className="text-slate-400">{percentage.toFixed(0)}%</span>
        </div>
        
        {/* Progress Bar styled like Shadcn UI */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50">
          <div 
            className="h-full bg-indigo-500 transition-all duration-200 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
