import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// In-memory script store (no DB needed for Replit/Railway deploy)
interface ScriptRecord {
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

let scriptStore: ScriptRecord[] = [];
let nextId = 1;

function buildAHKSystemPrompt(version: "v1" | "v2"): string {
  if (version === "v2") {
    return `You are an expert AutoHotkey v2 script writer. You write clean, well-commented, production-ready AHK v2 scripts.

AHK v2 rules you MUST follow:
- Use #Requires AutoHotkey v2.0 at the top
- Use MsgBox("text") not MsgBox, text
- Use Send("{key}") not Send, {key}
- Hotkeys use :: syntax: F1:: { ... }
- Variables do not use % % — just use varName
- String concatenation uses . operator
- Use A_IsAdmin for admin checks
- Loop syntax: Loop count { ... }
- Functions: MyFunc(param) { return value }
- Always add helpful comments explaining what each section does
- For Roblox macros: add safety delays between actions, use ControlSend or Send
- Always include a way to stop/exit the script (usually Escape:: ExitApp())

Return ONLY the AHK script code. No markdown, no explanation, no code blocks. Pure .ahk content.`;
  } else {
    return `You are an expert AutoHotkey v1 script writer. You write clean, well-commented, production-ready AHK v1 scripts.

AHK v1 rules you MUST follow:
- No #Requires line (v1 specific)
- Use MsgBox, text (comma syntax)  
- Send, {key} syntax
- Variables use %varName% in strings
- String concat: var = %var1% %var2%
- IfEqual, var, value style conditionals
- Loop, count style loops
- Always add helpful comments
- Include Escape:: ExitApp as safety

Return ONLY the AHK script code. No markdown, no explanation, no code blocks. Pure .ahk content.`;
  }
}

function extractTitle(prompt: string, code: string): string {
  // Try to extract a meaningful title from the prompt
  const cleaned = prompt.trim().substring(0, 60);
  // Capitalize first letter, trim
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/scripts — list all scripts
  app.get("/api/scripts", (req: Request, res: Response) => {
    res.json(scriptStore.sort((a, b) => b.id - a.id));
  });

  // GET /api/scripts/:id — get one script
  app.get("/api/scripts/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const script = scriptStore.find(s => s.id === id);
    if (!script) return res.status(404).json({ message: "Script not found" });
    res.json(script);
  });

  // POST /api/scripts/generate — AI script generation (core feature)
  app.post("/api/scripts/generate", async (req: Request, res: Response) => {
    const { prompt, version = "v2", apiKey } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const openaiKey = apiKey || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ 
        message: "No OpenAI API key configured. Add OPENAI_API_KEY to your environment or provide your own key." 
      });
    }

    try {
      const client = new OpenAI({ apiKey: openaiKey });

      const systemPrompt = buildAHKSystemPrompt(version as "v1" | "v2");

      const userMessage = `Write an AutoHotkey ${version} script that does the following:\n\n${prompt.trim()}\n\nMake it clean, commented, and ready to use.`;

      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const code = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!code) {
        return res.status(500).json({ message: "AI returned empty response. Please try again." });
      }

      // Strip any accidental markdown code fences
      const cleanCode = code
        .replace(/^```(?:ahk|autohotkey)?\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();

      const title = extractTitle(prompt, cleanCode);

      const script: ScriptRecord = {
        id: nextId++,
        title,
        description: `Generated from: ${prompt.substring(0, 100)}`,
        version,
        code: cleanCode,
        prompt: prompt.trim(),
        isFavorite: false,
        tags: [],
        createdAt: new Date(),
      };

      scriptStore.push(script);
      res.status(201).json(script);

    } catch (err: any) {
      console.error("OpenAI error:", err?.message);
      if (err?.status === 401) {
        return res.status(500).json({ message: "Invalid OpenAI API key." });
      }
      if (err?.status === 429) {
        return res.status(500).json({ message: "Rate limited by OpenAI. Please wait a moment and try again." });
      }
      res.status(500).json({ message: "Failed to generate script: " + (err?.message ?? "Unknown error") });
    }
  });

  // PUT /api/scripts/:id — update (rename, favourite, edit)
  app.put("/api/scripts/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const idx = scriptStore.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ message: "Script not found" });

    const { title, description, code, isFavorite, tags } = req.body;
    if (title !== undefined) scriptStore[idx].title = title;
    if (description !== undefined) scriptStore[idx].description = description;
    if (code !== undefined) scriptStore[idx].code = code;
    if (isFavorite !== undefined) scriptStore[idx].isFavorite = isFavorite;
    if (tags !== undefined) scriptStore[idx].tags = tags;

    res.json(scriptStore[idx]);
  });

  // DELETE /api/scripts/:id
  app.delete("/api/scripts/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const idx = scriptStore.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ message: "Script not found" });
    scriptStore.splice(idx, 1);
    res.status(204).send();
  });

  // GET /api/helpers/:name — serve helper AHK files
  app.get("/api/helpers/:name", (req: Request, res: Response) => {
    const { name } = req.params;
    const helpers: Record<string, string> = {
      recorder: `#Requires AutoHotkey v2.0
; AHK-AIForge Macro Recorder Helper
; Records keystrokes and mouse clicks to replay as a macro

global recording := false
global events := []

F9:: {
  global recording, events
  if recording {
    recording := false
    MsgBox("Recording stopped. " events.Length " events captured.", "Recorder")
  } else {
    events := []
    recording := true
    ToolTip("Recording... Press F9 to stop")
  }
}

~*LButton:: {
  global recording, events
  if recording {
    events.Push({ type: "click", x: A_CaretX, y: A_CaretY, t: A_TickCount })
  }
}

Escape:: ExitApp()
`,
      ocr: `#Requires AutoHotkey v2.0
; AHK-AIForge OCR Helper — reads text from screen region
; Requires Windows 10+ for built-in OCR

F10:: {
  try {
    ocrResult := ocr(0, 0, A_ScreenWidth, A_ScreenHeight)
    MsgBox(ocrResult, "OCR Result")
  } catch as e {
    MsgBox("OCR failed: " e.Message)
  }
}

Escape:: ExitApp()
`,
    };

    const content = helpers[name];
    if (!content) return res.status(404).json({ message: "Helper not found" });
    res.setHeader("Content-Type", "text/plain");
    res.send(content);
  });

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", scripts: scriptStore.length });
  });

  return httpServer;
}

