import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

function buildAHKSystemPrompt(version: "v1" | "v2"): string {
  if (version === "v2") {
    return `You are an expert AutoHotkey v2 script writer. Write clean, well-commented, production-ready AHK v2 scripts.

Rules:
- #Requires AutoHotkey v2.0 at top
- MsgBox("text") syntax
- Send("{key}") syntax
- No % % variable syntax
- String concat with . operator
- Loop count { } syntax
- Always include Escape:: ExitApp() safety exit
- For Roblox/PS99 macros: use realistic Sleep delays (100-500ms), never spam inputs

Return ONLY valid AHK v2 code. No markdown, no code fences, no explanation.`;
  }
  return `You are an expert AutoHotkey v1 script writer. Write clean, well-commented, production-ready AHK v1 scripts.

Rules:
- MsgBox, text (comma syntax)
- Send, {key} or SendInput, {key}
- %varName% in strings
- IfEqual/IfNotEqual conditionals
- Loop, count style
- Always include Esc:: ExitApp

Return ONLY valid AHK v1 code. No markdown, no code fences, no explanation.`;
}

function extractTitle(prompt: string): string {
  const trimmed = prompt.trim();
  const firstSentence = trimmed.split(/[.!?]/)[0];
  const title = (firstSentence.length < 60 ? firstSentence : trimmed.substring(0, 57) + "...").trim();
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/health", async (_req: Request, res: Response) => {
    const scripts = await storage.listScripts();
    res.json({ status: "ok", scriptCount: scripts.length });
  });

  app.get("/api/scripts", async (_req: Request, res: Response) => {
    const scripts = await storage.listScripts();
    res.json(scripts);
  });

  app.get("/api/scripts/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const script = await storage.getScript(id);
    if (!script) return res.status(404).json({ message: "Script not found" });
    res.json(script);
  });

  app.post("/api/scripts/generate", async (req: Request, res: Response) => {
    const { prompt, version = "v2", apiKey } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const userKey = apiKey?.trim();
    const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    const replitBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    const envKey = process.env.OPENAI_API_KEY;

    let client: OpenAI;
    if (userKey) {
      client = new OpenAI({ apiKey: userKey });
    } else if (replitKey && replitBaseUrl) {
      client = new OpenAI({ apiKey: replitKey, baseURL: replitBaseUrl });
    } else if (envKey) {
      client = new OpenAI({ apiKey: envKey });
    } else {
      return res.status(500).json({
        message: "No OpenAI key configured. Provide your own key in Advanced settings.",
      });
    }

    try {

      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: buildAHKSystemPrompt(version as "v1" | "v2") },
          {
            role: "user",
            content: `Write an AutoHotkey ${version} script that does:\n\n${prompt.trim()}\n\nMake it clean, commented, and ready to use immediately.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 2500,
      });

      let code = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!code) {
        return res.status(500).json({ message: "AI returned empty response. Please try again." });
      }

      // Strip accidental markdown code fences
      code = code.replace(/^```(?:ahk|autohotkey|plaintext)?\n?/i, "").replace(/\n?```$/i, "").trim();

      const script = await storage.createScript({
        title: extractTitle(prompt),
        description: `Generated from: ${prompt.substring(0, 120)}`,
        version,
        code,
        prompt: prompt.trim(),
        isFavorite: false,
        tags: [],
      });

      res.status(201).json(script);
    } catch (err: any) {
      console.error("OpenAI error:", err?.message);
      if (err?.status === 401) return res.status(500).json({ message: "Invalid OpenAI API key." });
      if (err?.status === 429) return res.status(500).json({ message: "OpenAI rate limit hit. Wait a moment and try again." });
      res.status(500).json({ message: "Generation failed: " + (err?.message ?? "Unknown error") });
    }
  });

  app.put("/api/scripts/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const updated = await storage.updateScript(id, req.body);
    if (!updated) return res.status(404).json({ message: "Script not found" });
    res.json(updated);
  });

  app.delete("/api/scripts/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const deleted = await storage.deleteScript(id);
    if (!deleted) return res.status(404).json({ message: "Script not found" });
    res.status(204).send();
  });

  app.get("/api/helpers/:name", (req: Request, res: Response) => {
    const helpers: Record<string, string> = {
      recorder: "#Requires AutoHotkey v2.0\n; AHK-AIForge Macro Recorder\n; Press F9 to start/stop\n\nglobal recording := false\nglobal events := []\n\nF9:: {\n  global recording, events\n  if recording {\n    recording := false\n    MsgBox(\"Stopped. \" events.Length \" events.\", \"Recorder\")\n  } else {\n    events := []\n    recording := true\n    ToolTip(\"Recording... F9 to stop\")\n  }\n}\n\nEscape:: ExitApp()\n",
    };
    const content = helpers[req.params.name];
    if (!content) return res.status(404).json({ message: "Helper not found" });
    res.setHeader("Content-Type", "text/plain");
    res.send(content);
  });

  return httpServer;
}
