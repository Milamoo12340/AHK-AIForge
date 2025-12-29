import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated locally.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your editor and generator preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editor Preferences</CardTitle>
          <CardDescription>Customize how code is displayed and handled.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Word Wrap</Label>
              <p className="text-sm text-muted-foreground">Wrap long lines in the code viewer</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Download</Label>
              <p className="text-sm text-muted-foreground">Prompt download immediately after generation</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Manage keys for external services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="openai-key">Default OpenAI API Key</Label>
            <Input id="openai-key" type="password" placeholder="sk-..." />
            <p className="text-xs text-muted-foreground">
              This key will be used for all generations unless overridden in the generator. 
              Stored locally in your browser.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
