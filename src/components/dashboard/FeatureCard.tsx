import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  illustration?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  gradient?: "purple" | "blue" | "green" | "amber" | "none";
  className?: string;
}

const gradientClasses = {
  purple: "from-examai-purple-500/20 to-violet-500/10",
  blue: "from-blue-500/20 to-cyan-500/10",
  green: "from-green-500/20 to-emerald-500/10",
  amber: "from-amber-500/20 to-orange-500/10",
  none: "",
};

export function FeatureCard({
  icon,
  title,
  description,
  illustration,
  href,
  onClick,
  gradient = "none",
  className,
}: FeatureCardProps) {
  const cardContent = (
    <>
      {illustration && (
        <div className="mb-4 h-24 flex items-center justify-center">
          {illustration}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-examai-purple-500/10 text-examai-purple-500">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </>
  );

  const baseClasses = cn(
    "group relative overflow-hidden rounded-xl border border-border bg-card p-6",
    "hover:border-examai-purple-500/40 transition-all duration-200",
    gradient !== "none" && `bg-gradient-to-br ${gradientClasses[gradient]}`,
    className
  );

  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, "text-left w-full")}>
        {cardContent}
      </button>
    );
  }

  return <div className={baseClasses}>{cardContent}</div>;
}

export default FeatureCard;
