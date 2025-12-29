import { useDownloadHelper } from "@/hooks/use-scripts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, MousePointer2, Scan, FileDown, Info } from "lucide-react";

export default function Recorder() {
  const downloadHelper = useDownloadHelper();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Standalone Helper Tools</h1>
        <p className="text-muted-foreground">
          Download these standalone AHK scripts to assist with recording inputs and detecting on-screen elements.
        </p>
      </div>

      <Alert className="bg-primary/10 border-primary/20 text-primary-foreground">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold">Requirement</AlertTitle>
        <AlertDescription className="text-primary/90">
          You must have AutoHotkey installed on your Windows machine to run these tools.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recorder Card */}
        <Card className="border-border bg-card/50 hover:bg-card transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
              <MousePointer2 className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle>Action Recorder</CardTitle>
            <CardDescription>
              Records your mouse clicks and keystrokes in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Records exact coordinates relative to window</li>
              <li>Captures key down/up durations</li>
              <li>Generates editable AHK code snippets</li>
              <li>Exports to clipboard for easy pasting</li>
            </ul>
            <Button className="w-full" onClick={() => downloadHelper('recorder')}>
              <FileDown className="w-4 h-4 mr-2" />
              Download Recorder.ahk
            </Button>
          </CardContent>
        </Card>

        {/* OCR Helper Card */}
        <Card className="border-border bg-card/50 hover:bg-card transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
              <Scan className="w-6 h-6 text-purple-500" />
            </div>
            <CardTitle>Boundary & OCR Helper</CardTitle>
            <CardDescription>
              Define screen regions for interaction or text detection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Draw boxes around screen areas</li>
              <li>Get exact coordinate strings: (X1, Y1, X2, Y2)</li>
              <li>Test color matching at specific pixels</li>
              <li>Essential for "Search Area" scripts</li>
            </ul>
            <Button className="w-full" onClick={() => downloadHelper('ocr')}>
              <FileDown className="w-4 h-4 mr-2" />
              Download OCR_Helper.ahk
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-[#0d1117] overflow-hidden">
        <div className="bg-[#161b22] px-4 py-2 border-b border-border flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">Workflow Guide</span>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">1</div>
              <div className="w-0.5 h-full bg-border mt-2" />
            </div>
            <div className="pb-8">
              <h3 className="font-semibold text-foreground">Record Actions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Run <code>Recorder.ahk</code>, press F9 to start recording, perform your game actions, and press F9 again to stop.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">2</div>
              <div className="w-0.5 h-full bg-border mt-2" />
            </div>
            <div className="pb-8">
              <h3 className="font-semibold text-foreground">Copy Generated Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The recorder will copy a block of code to your clipboard. It looks like a sequence of <code>MouseClick</code> and <code>Sleep</code> commands.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">3</div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Paste into Generator</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Go to the Generator tab and paste the raw data into the prompt, adding context: 
                <span className="italic block mt-1 text-primary/80">"Turn these recorded actions into a loop that toggles with F5: [PASTE HERE]"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
