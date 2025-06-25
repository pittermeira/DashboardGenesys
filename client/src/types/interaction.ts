export interface Interaction {
  id: number;
  conversationId: string;
  agent: string;
  customer: string;
  queue: string;
  mediaType: string;
  direction: string;
  duration: number; // in milliseconds
  wrapUp: string | null;
  flow: string | null;
  startTime: Date;
  endTime: Date;
  ani: string | null;
  dnis: string | null;
}

export interface InteractionFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  queue: string;
  agent: string;
  mediaType: string;
  wrapUp: string;
  flow: string;
}

export interface InteractionMetrics {
  totalInteractions: number;
  avgHandleTime: number;
  activeAgents: number;
  primaryChannelVolume: number;
  primaryChannelPercentage: number;
}

export interface AgentPerformance {
  agent: string;
  interactions: number;
  avgDuration: number;
  queues: string[];
}

export interface QueuePerformance {
  queue: string;
  interactions: number;
  avgDuration: number;
  percentage: number;
}
