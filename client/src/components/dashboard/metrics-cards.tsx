import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Clock, Users, MessageSquare, TrendingUp, TrendingDown } from "lucide-react";
import type { InteractionMetrics } from "@/types/interaction";
import { formatDuration } from "@/lib/data-utils";

interface MetricsCardsProps {
  metrics: InteractionMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Interactions",
      value: metrics.totalInteractions.toLocaleString(),
      icon: MessageCircle,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      trend: { value: "+8.2%", isPositive: true, label: "vs last period" }
    },
    {
      title: "Avg Handle Time",
      value: `${metrics.avgHandleTime}:00`,
      icon: Clock,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      trend: { value: "-2.1%", isPositive: true, label: "improvement" }
    },
    {
      title: "Active Agents",
      value: metrics.activeAgents.toString(),
      icon: Users,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      trend: { value: "3 agents", isPositive: false, label: "online" }
    },
    {
      title: "Primary Channel",
      value: metrics.primaryChannelVolume.toLocaleString(),
      icon: MessageSquare,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      trend: { value: `${metrics.primaryChannelPercentage}%`, isPositive: false, label: "of total volume" }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend.isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </h3>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              
              <div className="text-3xl font-bold text-foreground mb-2">
                {card.value}
              </div>
              
              <div className="flex items-center">
                {card.trend.isPositive && (
                  <TrendIcon className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm ${
                  card.trend.isPositive 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-muted-foreground"
                }`}>
                  {card.trend.value} {card.trend.label}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
