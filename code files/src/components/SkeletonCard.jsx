/**
 * Generic pulsing skeleton card for loading states.
 * Props: lines (number), height (px string), className
 */
export default function SkeletonCard({ lines = 3, height = "h-24", className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#e8f5e9] animate-pulse ${height} ${className}`}>
      <div className="h-3 bg-[#e8f5e9] rounded-full w-1/3 mb-3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`h-2.5 bg-[#e8f5e9] rounded-full mb-2 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
      ))}
    </div>
  );
}