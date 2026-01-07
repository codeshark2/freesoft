import { Activity, Clock, DollarSign, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color: "cyan" | "purple" | "green" | "amber";
}

const colorStyles = {
  cyan: "text-primary border-primary/30 bg-primary/5",
  purple: "text-secondary border-secondary/30 bg-secondary/5",
  green: "text-accent border-accent/30 bg-accent/5",
  amber: "text-glow-amber border-glow-amber/30 bg-glow-amber/5",
};

const MetricCard = ({ label, value, unit, icon, color }: MetricCardProps) => (
  <div className={cn(
    "terminal-panel p-4 border",
    colorStyles[color]
  )}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-display font-bold">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <div className={cn("p-2 rounded-lg border", colorStyles[color])}>
        {icon}
      </div>
    </div>
  </div>
);

const MetricsPanel = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total Latency"
        value="750"
        unit="ms"
        icon={<Clock className="h-5 w-5" />}
        color="cyan"
      />
      <MetricCard
        label="Tokens/sec"
        value="42"
        unit="t/s"
        icon={<Activity className="h-5 w-5" />}
        color="purple"
      />
      <MetricCard
        label="Est. Cost"
        value="0.003"
        unit="USD"
        icon={<DollarSign className="h-5 w-5" />}
        color="green"
      />
      <MetricCard
        label="Quality Score"
        value="94"
        unit="%"
        icon={<Gauge className="h-5 w-5" />}
        color="amber"
      />
    </div>
  );
};

export default MetricsPanel;
