import { interactions, users, type Interaction, type InsertInteraction, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Interaction methods
  getAllInteractions(): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  createManyInteractions(interactions: InsertInteraction[]): Promise<Interaction[]>;
  getInteractionsByDateRange(startDate: Date, endDate: Date): Promise<Interaction[]>;
  getInteractionsByQueue(queue: string): Promise<Interaction[]>;
  getInteractionsByAgent(agent: string): Promise<Interaction[]>;
  clearAllInteractions(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private interactions: Map<number, Interaction>;
  private currentUserId: number;
  private currentInteractionId: number;

  constructor() {
    this.users = new Map();
    this.interactions = new Map();
    this.currentUserId = 1;
    this.currentInteractionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllInteractions(): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = this.currentInteractionId++;
    const interaction: Interaction = { 
      ...insertInteraction, 
      id,
      wrapUp: insertInteraction.wrapUp || null,
      flow: insertInteraction.flow || null,
      ani: insertInteraction.ani || null,
      dnis: insertInteraction.dnis || null,
    };
    this.interactions.set(id, interaction);
    return interaction;
  }

  async createManyInteractions(insertInteractions: InsertInteraction[]): Promise<Interaction[]> {
    const createdInteractions: Interaction[] = [];
    for (const insertInteraction of insertInteractions) {
      const interaction = await this.createInteraction(insertInteraction);
      createdInteractions.push(interaction);
    }
    return createdInteractions;
  }

  async getInteractionsByDateRange(startDate: Date, endDate: Date): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(interaction => {
      const interactionDate = new Date(interaction.startTime);
      return interactionDate >= startDate && interactionDate <= endDate;
    });
  }

  async getInteractionsByQueue(queue: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(interaction => 
      interaction.queue.includes(queue)
    );
  }

  async getInteractionsByAgent(agent: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(interaction => 
      interaction.agent.includes(agent)
    );
  }

  async clearAllInteractions(): Promise<void> {
    this.interactions.clear();
    this.currentInteractionId = 1;
  }
}

export const storage = new MemStorage();
