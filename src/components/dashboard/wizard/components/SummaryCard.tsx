import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

interface SummaryCardProps {
  title: string;
  content: string | string[];
  editStep: number;
  onEdit: (step: number) => void;
  icon?: React.ReactNode;
  className?: string;
}

export const SummaryCard = ({
  title,
  content,
  editStep,
  onEdit,
  icon,
  className = "",
}: SummaryCardProps) => {
  const contentArray = Array.isArray(content) ? content : [content];
  const hasContent = contentArray.some((c) => c && c.trim().length > 0);

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm group ${className}`}
      onClick={() => onEdit(editStep)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Etapa {editStep}
            </Badge>
            <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasContent ? (
          <div className="space-y-1">
            {contentArray.map((item, idx) => (
              <p
                key={idx}
                className="text-sm text-muted-foreground line-clamp-2"
              >
                {item || "—"}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Nenhuma informação definida
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
