import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  name: string;
  type: "ASR" | "LLM" | "TTS";
  icon: LucideIcon;
  status: "online" | "offline" | "pending";
  latency?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const typeColors = {
  ASR: "text-primary border-primary/50 bg-primary/10",
  LLM: "text-secondary border-secondary/50 bg-secondary/10",
  TTS: "text-accent border-accent/50 bg-accent/10",
};

const statusColors = {
  online: "status-online",
  offline: "status-offline",
  pending: "bg-glow-amber animate-pulse-glow",
};

const VendorCard = ({ 
  name, 
  type, 
  icon: Icon, 
  status, 
  latency, 
  isSelected,
  onClick 
}: VendorCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "vendor-card w-full text-left",
        isSelected && "glow-border border-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg border",
            typeColors[type]
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{name}</h3>
            <Badge variant="outline" className={cn("text-xs mt-1", typeColors[type])}>
              {type}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", statusColors[status])} />
            <span className="text-xs text-muted-foreground capitalize">{status}</span>
          </div>
          {latency !== undefined && (
            <span className="text-xs font-mono text-muted-foreground">
              {latency}ms
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default VendorCard;
