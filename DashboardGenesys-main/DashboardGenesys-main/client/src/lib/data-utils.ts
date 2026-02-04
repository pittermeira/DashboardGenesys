import { format, startOfHour, differenceInMinutes } from "date-fns";
import type { Interaction, InteractionMetrics, AgentPerformance, QueuePerformance } from "@/types/interaction";

export function calculateMetrics(interactions: Interaction[]): InteractionMetrics {
  const totalInteractions = interactions.length;
  
  // Calculate average handle time in minutes
  const totalDuration = interactions.reduce((sum, interaction) => sum + interaction.duration, 0);
  const avgHandleTime = totalInteractions > 0 ? Math.round(totalDuration / totalInteractions / 1000 / 60) : 0;
  
  // Count unique agents
  const uniqueAgents = new Set(interactions.map(i => i.agent));
  const activeAgents = uniqueAgents.size;
  
  // Calculate primary channel (most common media type) volume
  const mediaTypeCounts = interactions.reduce((acc, interaction) => {
    acc[interaction.mediaType] = (acc[interaction.mediaType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const primaryChannel = Object.entries(mediaTypeCounts).length > 0 
    ? Object.entries(mediaTypeCounts).reduce((a, b) => 
        mediaTypeCounts[a[0]] > mediaTypeCounts[b[0]] ? a : b
      )
    : null;
  
  const primaryChannelVolume = primaryChannel ? primaryChannel[1] : 0;
  const primaryChannelPercentage = totalInteractions > 0 
    ? Math.round((primaryChannelVolume / totalInteractions) * 100) 
    : 0;

  return {
    totalInteractions,
    avgHandleTime,
    activeAgents,
    primaryChannelVolume,
    primaryChannelPercentage,
  };
}

export function getTopAgents(interactions: Interaction[], limit: number = 5): AgentPerformance[] {
  const agentStats = interactions.reduce((acc, interaction) => {
    if (!acc[interaction.agent]) {
      acc[interaction.agent] = {
        agent: interaction.agent,
        interactions: 0,
        totalDuration: 0,
        queues: new Set<string>(),
      };
    }
    
    acc[interaction.agent].interactions++;
    acc[interaction.agent].totalDuration += interaction.duration;
    acc[interaction.agent].queues.add(interaction.queue);
    
    return acc;
  }, {} as Record<string, { agent: string; interactions: number; totalDuration: number; queues: Set<string> }>);

  return Object.values(agentStats)
    .map(stats => ({
      agent: stats.agent,
      interactions: stats.interactions,
      avgDuration: Math.round(stats.totalDuration / stats.interactions / 1000 / 60),
      queues: Array.from(stats.queues),
    }))
    .sort((a, b) => b.interactions - a.interactions)
    .slice(0, limit);
}

export function getQueueDistribution(interactions: Interaction[]): QueuePerformance[] {
  const queueStats = interactions.reduce((acc, interaction) => {
    if (!acc[interaction.queue]) {
      acc[interaction.queue] = {
        queue: interaction.queue,
        interactions: 0,
        totalDuration: 0,
      };
    }
    
    acc[interaction.queue].interactions++;
    acc[interaction.queue].totalDuration += interaction.duration;
    
    return acc;
  }, {} as Record<string, { queue: string; interactions: number; totalDuration: number }>);

  const totalInteractions = interactions.length;

  return Object.values(queueStats)
    .map(stats => ({
      queue: stats.queue,
      interactions: stats.interactions,
      avgDuration: Math.round(stats.totalDuration / stats.interactions / 1000 / 60),
      percentage: Math.round((stats.interactions / totalInteractions) * 100),
    }))
    .sort((a, b) => b.interactions - a.interactions);
}

export function getHourlyTrend(interactions: Interaction[]): { hour: string; count: number }[] {
  const hourlyStats = interactions.reduce((acc, interaction) => {
    const hour = format(startOfHour(new Date(interaction.startTime)), "HH:mm");
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate all hours from 07:00 to 18:00
  const hours = [];
  for (let i = 7; i <= 18; i++) {
    const hour = `${i.toString().padStart(2, '0')}:00`;
    hours.push({
      hour,
      count: hourlyStats[hour] || 0,
    });
  }

  return hours;
}

export function formatDuration(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 1000 / 60);
  const seconds = Math.floor((milliseconds / 1000) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getAgentInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function getUniqueValues<T>(items: T[], key: keyof T): string[] {
  const values = items.map(item => String(item[key])).filter(Boolean);
  return Array.from(new Set(values)).sort();
}
