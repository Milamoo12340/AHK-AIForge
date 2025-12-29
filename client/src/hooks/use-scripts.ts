import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GenerateScriptRequest, type UpdateScriptRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/scripts
export function useScripts() {
  return useQuery({
    queryKey: [api.scripts.list.path],
    queryFn: async () => {
      const res = await fetch(api.scripts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scripts");
      return api.scripts.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/scripts/:id
export function useScript(id: number) {
  return useQuery({
    queryKey: [api.scripts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.scripts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch script");
      return api.scripts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/scripts/generate
export function useGenerateScript() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GenerateScriptRequest) => {
      // Validate input before sending using the schema from API definition
      // Note: We're doing client-side validation implicitly via types here
      const res = await fetch(api.scripts.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.scripts.generate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
           const error = api.scripts.generate.responses[500].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to generate script");
      }
      return api.scripts.generate.responses[201].parse(await res.json());
    },
    onSuccess: (newScript) => {
      queryClient.invalidateQueries({ queryKey: [api.scripts.list.path] });
      toast({
        title: "Script Generated",
        description: `Successfully generated "${newScript.title}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// PUT /api/scripts/:id
export function useUpdateScript() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateScriptRequest) => {
      const url = buildUrl(api.scripts.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Script not found");
        throw new Error("Failed to update script");
      }
      return api.scripts.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedScript) => {
      queryClient.invalidateQueries({ queryKey: [api.scripts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.scripts.get.path, updatedScript.id] });
      toast({
        title: "Script Updated",
        description: "Your changes have been saved.",
      });
    },
  });
}

// DELETE /api/scripts/:id
export function useDeleteScript() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.scripts.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Script not found");
        throw new Error("Failed to delete script");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scripts.list.path] });
      toast({
        title: "Script Deleted",
        description: "The script has been removed from your library.",
      });
    },
  });
}

// Helper to download raw files
export function useDownloadHelper() {
  const { toast } = useToast();
  
  return async (name: string) => {
    try {
      const url = buildUrl(api.scripts.downloadHelper.path, { name });
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to download helper");
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${name}.ahk`; // Force .ahk extension
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
      
      toast({
        title: "Download Started",
        description: `${name}.ahk is downloading...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not retrieve the helper file.",
        variant: "destructive",
      });
    }
  };
}
