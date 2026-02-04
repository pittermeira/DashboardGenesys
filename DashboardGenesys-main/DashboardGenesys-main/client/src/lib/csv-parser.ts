import Papa from "papaparse";
import { format, parse } from "date-fns";
import type { InsertInteraction } from "@shared/schema";

export interface CSVRow {
  "Full Export Completed": string;
  "Partial Result Timestamp": string;
  "Filters": string;
  "Media Type": string;
  "Users": string;
  "Remote": string;
  "Date": string;
  "End Date": string;
  "Duration": string;
  "Direction": string;
  "ANI": string;
  "DNIS": string;
  "Queue": string;
  "Wrap-up": string;
  "Flow": string;
  "Conversation ID": string;
}

function parseDateString(dateStr: string): Date {
  try {
    // Handle format like "6/23/25 07:00 AM"
    const cleanDate = dateStr.trim();
    const parsed = parse(cleanDate, "M/d/yy h:mm a", new Date());
    return parsed;
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`, error);
    return new Date();
  }
}

function parseDuration(durationStr: string): number {
  try {
    // Duration is in milliseconds as string
    const duration = parseInt(durationStr.trim(), 10);
    return isNaN(duration) ? 0 : duration;
  } catch (error) {
    console.warn(`Failed to parse duration: ${durationStr}`, error);
    return 0;
  }
}

function extractAgentNames(usersStr: string): string {
  // Extract agent names from "Users" field, handling multiple agents
  const agents = usersStr.split(';').map(agent => agent.trim()).filter(Boolean);
  return agents[0] || "Unknown Agent";
}

function extractQueueName(queueStr: string): string {
  // Extract primary queue from "Queue" field
  const queues = queueStr.split(';').map(queue => queue.trim()).filter(Boolean);
  return queues[0] || "Unknown Queue";
}

export function parseCSVData(csvText: string): Promise<InsertInteraction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const interactions: InsertInteraction[] = results.data
            .filter(row => {
              // Filter out invalid rows
              return row["Conversation ID"] && 
                     row["Date"] && 
                     row["End Date"] && 
                     row["Users"] && 
                     row["Remote"];
            })
            .map(row => {
              const startTime = parseDateString(row["Date"]);
              const endTime = parseDateString(row["End Date"]);
              const duration = parseDuration(row["Duration"]);
              
              return {
                conversationId: row["Conversation ID"].trim(),
                agent: extractAgentNames(row["Users"]),
                customer: row["Remote"].trim(),
                queue: extractQueueName(row["Queue"]),
                mediaType: row["Media Type"]?.trim() || "message",
                direction: row["Direction"]?.trim() || "Inbound/Outbound",
                duration,
                wrapUp: row["Wrap-up"]?.trim() || null,
                flow: row["Flow"]?.trim() || null,
                startTime,
                endTime,
                ani: row["ANI"]?.trim() || null,
                dnis: row["DNIS"]?.trim() || null,
              };
            });

          resolve(interactions);
        } catch (error) {
          reject(new Error(`Failed to parse CSV data: ${error}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export async function uploadCSVFile(file: File): Promise<InsertInteraction[]> {
  const text = await file.text();
  return parseCSVData(text);
}
