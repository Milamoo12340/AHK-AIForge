import { randomUUID } from "crypto";

// Script storage interface
export interface ScriptRecord {
  id: number;
  title: string;
  description: string | null;
  version: string;
  code: string;
  prompt: string;
  isFavorite: boolean;
  tags: string[] | null;
  createdAt: Date;
}

export interface IStorage {
  listScripts(): Promise<ScriptRecord[]>;
  getScript(id: number): Promise<ScriptRecord | undefined>;
  createScript(script: Omit<ScriptRecord, "id" | "createdAt">): Promise<ScriptRecord>;
  updateScript(id: number, updates: Partial<ScriptRecord>): Promise<ScriptRecord | undefined>;
  deleteScript(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private scripts: Map<number, ScriptRecord> = new Map();
  private nextId = 1;

  async listScripts(): Promise<ScriptRecord[]> {
    return Array.from(this.scripts.values()).sort((a, b) => b.id - a.id);
  }

  async getScript(id: number): Promise<ScriptRecord | undefined> {
    return this.scripts.get(id);
  }

  async createScript(data: Omit<ScriptRecord, "id" | "createdAt">): Promise<ScriptRecord> {
    const script: ScriptRecord = {
      ...data,
      id: this.nextId++,
      createdAt: new Date(),
    };
    this.scripts.set(script.id, script);
    return script;
  }

  async updateScript(id: number, updates: Partial<ScriptRecord>): Promise<ScriptRecord | undefined> {
    const existing = this.scripts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.scripts.set(id, updated);
    return updated;
  }

  async deleteScript(id: number): Promise<boolean> {
    return this.scripts.delete(id);
  }
}

export const storage = new MemStorage();

