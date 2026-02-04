import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Charts } from "@/components/dashboard/charts";
import type { Interaction } from "@/types/interaction";
import { 
  calculateMetrics, 
  getTopAgents, 
  getQueueDistribution, 
  getUniqueValues 
} from "@/lib/data-utils";

interface AnalysisPageProps {
  interactions: Interaction[];
  analysisType: "queue" | "agent" | "time" | "wrapup";
}

export function AnalysisPage({ interactions, analysisType }: AnalysisPageProps) {
  const analysisData = useMemo(() => {
    switch (analysisType) {
      case "queue":
        return getQueueDistribution(interactions);
      case "agent":
        return getTopAgents(interactions, 10);
      case "time":
        return interactions.reduce((acc, interaction) => {
          const hour = new Date(interaction.startTime).getHours();
          const key = `${hour}:00`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      case "wrapup":
        return interactions.reduce((acc, interaction) => {
          if (interaction.wrapUp) {
            const wrapUps = interaction.wrapUp.split(';').map(w => w.trim());
            wrapUps.forEach(wrapUp => {
              acc[wrapUp] = (acc[wrapUp] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<string, number>);
      default:
        return [];
    }
  }, [interactions, analysisType]);

  const getTitle = () => {
    switch (analysisType) {
      case "queue":
        return "Queue Analysis";
      case "agent":
        return "Agent Performance Analysis";
      case "time":
        return "Time Series Analysis";
      case "wrapup":
        return "Wrap-up Code Analysis";
      default:
        return "Analysis";
    }
  };

  const getDescription = () => {
    switch (analysisType) {
      case "queue":
        return "Detailed breakdown of interaction distribution across different queues";
      case "agent":
        return "Performance metrics and statistics for individual agents";
      case "time":
        return "Hourly distribution of interactions throughout the day";
      case "wrapup":
        return "Analysis of wrap-up codes used in customer interactions";
      default:
        return "Detailed analysis of interaction data";
    }
  };

  if (interactions.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Upload interaction data to view {getTitle().toLowerCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{getTitle()}</h1>
        <p className="text-muted-foreground mt-2">{getDescription()}</p>
        <Badge variant="secondary" className="mt-2">
          {interactions.length} total interactions
        </Badge>
      </div>

      {analysisType === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analysisData as any[]).map((queue, index) => (
                  <div key={queue.queue} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{queue.queue}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg duration: {queue.avgDuration} min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{queue.interactions}</div>
                      <div className="text-sm text-muted-foreground">{queue.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Charts 
            interactions={interactions}
            topAgents={getTopAgents(interactions)}
            queueDistribution={getQueueDistribution(interactions)}
          />
        </div>
      )}

      {analysisType === "agent" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analysisData as any[]).map((agent, index) => (
                  <div key={agent.agent} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{agent.agent}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg duration: {agent.avgDuration} min • {agent.queues.length} queues
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{agent.interactions}</div>
                      <div className="text-sm text-muted-foreground">interactions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Charts 
            interactions={interactions}
            topAgents={getTopAgents(interactions)}
            queueDistribution={getQueueDistribution(interactions)}
          />
        </div>
      )}

      {analysisType === "time" && (
        <div className="space-y-6">
          <Charts 
            interactions={interactions}
            topAgents={getTopAgents(interactions)}
            queueDistribution={getQueueDistribution(interactions)}
          />
          <Card>
            <CardHeader>
              <CardTitle>Hourly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {Object.entries(analysisData as Record<string, number>)
                  .sort(([a], [b]) => parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]))
                  .map(([hour, count]) => (
                    <div key={hour} className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-semibold">{count}</div>
                      <div className="text-sm text-muted-foreground">{hour}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisType === "wrapup" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wrap-up Code Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysisData as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .map(([wrapUp, count]) => (
                    <div key={wrapUp} className="p-3 border rounded-lg">
                      <div className="font-medium truncate">{wrapUp}</div>
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-sm text-muted-foreground">
                        {((count / interactions.length) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}