import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { BnccSkill } from "../WizardContext";

interface BnccChipsProps {
  skills: BnccSkill[];
  onRemove: (code: string) => void;
  className?: string;
}

export const BnccChips = ({ skills, onRemove, className = "" }: BnccChipsProps) => {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {skills.map((skill) => (
        <Badge
          key={skill.code}
          variant="secondary"
          className="px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          <span className="font-mono text-xs text-primary">{skill.code}</span>
          <span className="text-muted-foreground">|</span>
          <span className="max-w-[200px] truncate" title={skill.description}>
            {skill.description.length > 40
              ? `${skill.description.substring(0, 40)}...`
              : skill.description}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(skill.code);
            }}
            className="ml-1 hover:text-destructive transition-colors rounded-full p-0.5 hover:bg-destructive/10"
            aria-label={`Remover ${skill.code}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};

export default BnccChips;
