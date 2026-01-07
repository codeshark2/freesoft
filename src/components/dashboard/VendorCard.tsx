import { LucideIcon, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VendorType } from "@/lib/vendors/types";

interface VendorCardProps {
  name: string;
  type: VendorType;
  icon: LucideIcon;
  status: "online" | "offline" | "pending" | "not_configured";
  latency?: number;
  isSelected?: boolean;
  isConfigured?: boolean;
  docsUrl?: string;
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
  not_configured: "bg-muted-foreground/30",
};

const statusLabels = {
  online: "online",
  offline: "offline",
  pending: "pending",
  not_configured: "not configured",
};

const VendorCard = ({ 
  name, 
  type, 
  icon: Icon, 
  status, 
  latency, 
  isSelected,
  isConfigured = true,
  docsUrl,
  onClick 
}: VendorCardProps) => {
  return (
    <button
      onClick={isConfigured ? onClick : undefined}
      disabled={!isConfigured}
      className={cn(
        "vendor-card w-full text-left",
        isSelected && isConfigured && "glow-border border-primary",
        !isConfigured && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg border",
            typeColors[type],
            !isConfigured && "opacity-50"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-xs", typeColors[type])}>
                {type}
              </Badge>
              {!isConfigured && docsUrl && (
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", statusColors[status])} />
            <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
          </div>
          {latency !== undefined && isConfigured && (
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