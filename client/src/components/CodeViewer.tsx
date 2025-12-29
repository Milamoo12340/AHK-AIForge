import { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-autohotkey";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  code: string;
  title?: string;
  language?: string;
  className?: string;
  onDownload?: () => void;
}

export function CodeViewer({ code, title = "Script.ahk", language = "autohotkey", className, onDownload }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-xl border border-border bg-[#0d1117] overflow-hidden flex flex-col shadow-xl", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-border">
        <div className="flex items-center gap-2">
           <div className="flex gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-500/80" />
             <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
             <div className="w-3 h-3 rounded-full bg-green-500/80" />
           </div>
           <span className="ml-3 text-sm text-muted-foreground font-mono">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {onDownload && (
            <button 
              onClick={onDownload}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4 overflow-auto max-h-[500px] relative font-mono text-sm leading-relaxed">
        <pre className={`language-${language}`}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
