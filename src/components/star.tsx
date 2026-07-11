export function Star({ size = 16, className = "" }: { size?: number | string; className?: string }) {
  return (
    <img
      src="/star-yellow.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}

export function PinkStar({ size = 16, className = "" }: { size?: number | string; className?: string }) {
  return (
    <img
      src="/star-pink.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}

export function BlueStar({ size = 16, className = "" }: { size?: number | string; className?: string }) {
  return (
    <img
      src="/star-blue.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}
