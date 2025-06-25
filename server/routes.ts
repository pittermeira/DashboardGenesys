import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInteractionSchema } from "@shared/schema";
import { z } from "zod";

const bulkInteractionsSchema = z.array(insertInteractionSchema);

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all interactions
  app.get("/api/interactions", async (req, res) => {
    try {
      const interactions = await storage.getAllInteractions();
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // Create single interaction
  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.json(interaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create interaction" });
      }
    }
  });

  // Bulk create interactions (for CSV upload)
  app.post("/api/interactions/bulk", async (req, res) => {
    try {
      const validatedData = bulkInteractionsSchema.parse(req.body);
      const interactions = await storage.createManyInteractions(validatedData);
      res.json({ message: `Successfully imported ${interactions.length} interactions`, interactions });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interactions data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to import interactions" });
      }
    }
  });

  // Clear all interactions
  app.delete("/api/interactions", async (req, res) => {
    try {
      await storage.clearAllInteractions();
      res.json({ message: "All interactions cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear interactions" });
    }
  });

  // Get interactions by date range
  app.get("/api/interactions/date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const interactions = await storage.getInteractionsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions by date range" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
