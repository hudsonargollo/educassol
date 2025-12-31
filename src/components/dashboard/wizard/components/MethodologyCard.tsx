import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  FolderKanban,
  RefreshCw,
  Gamepad2,
  Users,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";

// Icon mapping for methodology options
const ICON_MAP: Record<string, LucideIcon> = {
  Lightbulb,
  FolderKanban,
  RefreshCw,
  Gamepad2,
  Users,
  LayoutGrid,
};

interface MethodologyCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const MethodologyCard = ({
  id,
  name,
  icon,
  description,
  isSelected,
  onToggle,
}: MethodologyCardProps) => {
  const IconComponent = ICON_MAP[icon] || Lightbulb;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "hover:border-primary/50"
      }`}
      onClick={() => onToggle(id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSelected ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <IconComponent
              className={`h-5 w-5 ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`text-sm font-semibold ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          {isSelected && (
            <div className="flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MethodologyCard;
