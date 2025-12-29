import { useScripts, useDeleteScript } from "@/hooks/use-scripts";
import { format } from "date-fns";
import { Code, Calendar, Trash2, Tag, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CodeViewer } from "@/components/CodeViewer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Library() {
  const { data: scripts, isLoading } = useScripts();
  const { mutate: deleteScript } = useDeleteScript();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredScripts = scripts?.filter(script => 
    script.title.toLowerCase().includes(search.toLowerCase()) || 
    script.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownload = (script: any) => {
    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}.ahk`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Script Library</h1>
          <p className="text-muted-foreground">Manage your generated automation scripts.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search scripts..." 
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredScripts?.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <Code className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No scripts found</h3>
          <p className="text-muted-foreground mt-2">Create your first automation in the Generator tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts?.map((script) => (
            <div key={script.id} className="group bg-card hover:border-primary/50 transition-colors border border-border rounded-xl p-5 flex flex-col shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  {script.version}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Script?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete "{script.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteScript(script.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <h3 className="font-bold text-lg mb-1 truncate" title={script.title}>{script.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                {script.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(script.createdAt || new Date()), "MMM d, yyyy")}
                </div>
                {script.tags && script.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {script.tags.length} tags
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Code className="w-4 h-4 mr-2" />
                      View Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <div className="flex-1 overflow-hidden pt-4">
                       <CodeViewer code={script.code} title={script.title} onDownload={() => handleDownload(script)} />
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="secondary" size="icon" onClick={() => handleCopy(script.code)} title="Copy Code">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => handleDownload(script)} title="Download .ahk">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
