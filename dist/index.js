import nodePath from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);


// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  interactions;
  currentUserId;
  currentInteractionId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.interactions = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentInteractionId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getAllInteractions() {
    return Array.from(this.interactions.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }
  async createInteraction(insertInteraction) {
    const id = this.currentInteractionId++;
    const interaction = {
      ...insertInteraction,
      id,
      wrapUp: insertInteraction.wrapUp || null,
      flow: insertInteraction.flow || null,
      ani: insertInteraction.ani || null,
      dnis: insertInteraction.dnis || null
    };
    this.interactions.set(id, interaction);
    return interaction;
  }
  async createManyInteractions(insertInteractions) {
    const createdInteractions = [];
    for (const insertInteraction of insertInteractions) {
      const interaction = await this.createInteraction(insertInteraction);
      createdInteractions.push(interaction);
    }
    return createdInteractions;
  }
  async getInteractionsByDateRange(startDate, endDate) {
    return Array.from(this.interactions.values()).filter((interaction) => {
      const interactionDate = new Date(interaction.startTime);
      return interactionDate >= startDate && interactionDate <= endDate;
    });
  }
  async getInteractionsByQueue(queue) {
    return Array.from(this.interactions.values()).filter(
      (interaction) => interaction.queue.includes(queue)
    );
  }
  async getInteractionsByAgent(agent) {
    return Array.from(this.interactions.values()).filter(
      (interaction) => interaction.agent.includes(agent)
    );
  }
  async clearAllInteractions() {
    this.interactions.clear();
    this.currentInteractionId = 1;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  agent: text("agent").notNull(),
  customer: text("customer").notNull(),
  queue: text("queue").notNull(),
  mediaType: text("media_type").notNull(),
  direction: text("direction").notNull(),
  duration: integer("duration").notNull(),
  // in milliseconds
  wrapUp: text("wrap_up"),
  flow: text("flow"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  ani: text("ani"),
  dnis: text("dnis")
});
var insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true
}).extend({
  startTime: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform((str) => new Date(str))])
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/routes.ts
import { z as z2 } from "zod";
var bulkInteractionsSchema = z2.array(insertInteractionSchema);
async function registerRoutes(app2) {
  app2.get("/api/interactions", async (req, res) => {
    try {
      const interactions2 = await storage.getAllInteractions();
      res.json(interactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });
  app2.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.json(interaction);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid interaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create interaction" });
      }
    }
  });
  app2.post("/api/interactions/bulk", async (req, res) => {
    try {
      const validatedData = bulkInteractionsSchema.parse(req.body);
      const interactions2 = await storage.createManyInteractions(validatedData);
      res.json({ message: `Successfully imported ${interactions2.length} interactions`, interactions: interactions2 });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid interactions data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to import interactions" });
      }
    }
  });
  app2.delete("/api/interactions", async (req, res) => {
    try {
      await storage.clearAllInteractions();
      res.json({ message: "All interactions cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear interactions" });
    }
  });
  app2.get("/api/interactions/date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const interactions2 = await storage.getInteractionsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      res.json(interactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions by date range" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const root = path2.resolve(__dirname, "..", "client");
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    root,
    resolve: {
      ...vite_config_default.resolve,
      alias: {
        ...vite_config_default.resolve?.alias,
        "@": path2.resolve(root, "src"),
        "@shared": path2.resolve(__dirname, "..", "shared"),
        "@assets": path2.resolve(__dirname, "..", "attached_assets")
      }
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
