import { useState } from "react";
import { useGenerateScript } from "@/hooks/use-scripts";
import { CodeViewer } from "@/components/CodeViewer";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Send, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Generator() {
  const [prompt, setPrompt] = useState("");
  const [version, setVersion] = useState<"v1" | "v2">("v2");
  const [apiKey, setApiKey] = useState("");
  const { mutate: generate, isPending, data: generatedScript, error } = useGenerateScript();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generate({ prompt, version, apiKey: apiKey || undefined });
  };

  const handleDownload = () => {
    if (!generatedScript) return;
    const blob = new Blob([generatedScript.code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedScript.title.replace(/\s+/g, '_')}.ahk`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent w-fit">
          Script Generator
        </h1>
        <p className="text-muted-foreground">Describe what you want your AutoHotkey script to do.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">AHK Version</label>
              <Select value={version} onValueChange={(v: "v1" | "v2") => setVersion(v)}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2">AutoHotkey v2 (Recommended)</SelectItem>
                  <SelectItem value="v1">AutoHotkey v1 (Legacy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Instructions</label>
              <Textarea 
                placeholder="E.g., Create a script that rapidly clicks the left mouse button when I hold down F1, and stops when I release it."
                className="min-h-[200px] resize-none text-base bg-background/50 focus:bg-background transition-colors"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleGenerate} 
                disabled={isPending || !prompt.trim()}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Logic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </div>
            
             {/* API Key Optional */}
            <div className="pt-4 border-t border-border/50">
               <details className="text-sm text-muted-foreground">
                 <summary className="cursor-pointer hover:text-primary transition-colors">Advanced: Use custom OpenAI Key</summary>
                 <div className="mt-3">
                   <input 
                      type="password" 
                      placeholder="sk-..." 
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:border-primary outline-none"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                   />
                   <p className="text-xs mt-1 text-muted-foreground/80">Leave blank to use the built-in system key.</p>
                 </div>
               </details>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {generatedScript ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedScript.title}</h3>
                    <p className="text-xs text-muted-foreground">Generated just now</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                       <Download className="w-4 h-4 mr-2" />
                       Download
                    </Button>
                  </div>
                </div>
                
                <CodeViewer 
                  code={generatedScript.code} 
                  title={`${generatedScript.title.slice(0, 20)}.ahk`}
                  onDownload={handleDownload}
                />
                
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" /> 
                    How to run
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Download and install AutoHotkey {version}</li>
                    <li>Download the script file above</li>
                    <li>Double-click the .ahk file to launch</li>
                  </ol>
                </div>
              </motion.div>
            ) : isPending ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card/30 rounded-xl border border-border/50 border-dashed">
                <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                   <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-medium mb-2">Analyzing Request</h3>
                <div className="text-muted-foreground h-6">
                   <TypewriterEffect text="Designing logic flow... Writing hotkey definitions... Optimizing syntax..." speed={50} />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card/30 rounded-xl border border-border/50 border-dashed">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                  <Terminal className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Ready to Code</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-2">
                  Enter your requirements on the left and I'll generate the AutoHotkey script for you instantly.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
