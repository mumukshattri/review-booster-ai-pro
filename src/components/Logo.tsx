import logoImg from "@/assets/reviewboost-logo.jpg";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ size = 32, className = "", showText = true, textClassName = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logoImg}
        alt="ReviewBoost"
        width={size}
        height={size}
        className="rounded-lg object-cover shrink-0"
      />
      {showText && (
        <span className={`text-lg font-bold tracking-tight ${textClassName || "text-foreground"}`}>
          ReviewBoost
        </span>
      )}
    </div>
  );
}
