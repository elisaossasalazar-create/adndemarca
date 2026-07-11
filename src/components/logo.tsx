import { PinkStar } from "@/components/star";

export function TheBrandCampLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-bold leading-[1.05] lowercase text-neutral-900 ${className}`}>
      <div>the</div>
      <div>brand</div>
      <div className="flex items-center">
        <span>c</span>
        <PinkStar size="1.05em" />
        <span>mp</span>
      </div>
    </div>
  );
}
