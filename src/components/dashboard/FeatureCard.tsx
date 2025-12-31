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
  purple: "from-examai-purple-500/10 to-violet-500/5 dark:from-examai-purple-500/20 dark:to-violet-500/10 hover:from-examai-purple-500/20 hover:to-violet-500/10 dark:hover:from-examai-purple-500/30 dark:hover:to-violet-500/20",
  blue: "from-blue-500/10 to-cyan-500/5 dark:from-blue-500/20 dark:to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/10 dark:hover:from-blue-500/30 dark:hover:to-cyan-500/20",
  green: "from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/10 dark:hover:from-green-500/30 dark:hover:to-emerald-500/20",
  amber: "from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/10 dark:hover:from-amber-500/30 dark:hover:to-orange-500/20",
  none: "",
};

const iconColorClasses = {
  purple: "bg-examai-purple-500/15 text-examai-purple-600 dark:text-examai-purple-400 group-hover:bg-examai-purple-500/25 group-hover:scale-110",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/25 group-hover:scale-110",
  green: "bg-green-500/15 text-green-600 dark:text-green-400 group-hover:bg-green-500/25 group-hover:scale-110",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/25 group-hover:scale-110",
  none: "bg-examai-purple-500/15 text-examai-purple-600 dark:text-examai-purple-400 group-hover:bg-examai-purple-500/25 group-hover:scale-110",
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
      {/* Animated background decoration */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-examai-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-violet-500/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
      </div>
      
      {illustration && (
        <div className="mb-4 h-24 flex items-center justify-center relative z-10">
          {illustration}
        </div>
      )}
      <div className="flex items-start gap-3 relative z-10">
        <div className={cn(
          "flex-shrink-0 p-2.5 rounded-xl transition-all duration-300",
          iconColorClasses[gradient]
        )}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-examai-purple-600 dark:group-hover:text-examai-purple-400 transition-colors duration-300">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      
      {/* Arrow indicator for clickable cards */}
      {(href || onClick) && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <svg className="w-5 h-5 text-examai-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </>
  );

  const baseClasses = cn(
    "group relative overflow-hidden rounded-xl border bg-card p-6",
    "border-border/60 dark:border-border/40",
    "hover:border-examai-purple-500/50 hover:shadow-lg dark:hover:shadow-examai-purple-500/10",
    "hover:-translate-y-1 active:translate-y-0 active:scale-[0.99]",
    "transition-all duration-300 ease-out",
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
