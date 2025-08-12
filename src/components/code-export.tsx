"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Download, Share2, Copy, FileText, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeExportProps {
  code: string;
  language: string;
  title?: string;
}

const FILE_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  html: "html",
  css: "css",
  sql: "sql",
  react: "jsx",
  tsx: "tsx",
};

export function CodeExport({ code, language, title = "snippet" }: CodeExportProps) {
  const [fileName, setFileName] = useState(`${title}.${FILE_EXTENSIONS[language] || "txt"}`);
  const [exportFormat, setExportFormat] = useState<"file" | "gist" | "share">("file");
  const [gistDescription, setGistDescription] = useState("");
  const [isPublicGist, setIsPublicGist] = useState(false);
  const { toast } = useToast();

  const downloadAsFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "¡Descarga iniciada!",
      description: `Archivo ${fileName} descargado correctamente.`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "¡Copiado!",
        description: "Código copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles.",
        variant: "destructive",
      });
    }
  };

  const createGist = async () => {
    // Simulación de creación de Gist (necesitarías implementar la API de GitHub)
    toast({
      title: "Función en desarrollo",
      description: "La creación de Gists estará disponible pronto.",
    });
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Código: ${title}`,
          text: code,
        });
      } catch (error) {
        // Fallback a copiar al portapapeles
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar código</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Formato de exportación</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descargar archivo
                  </div>
                </SelectItem>
                <SelectItem value="gist">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    Crear Gist
                  </div>
                </SelectItem>
                <SelectItem value="share">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportFormat === "file" && (
            <div className="space-y-2">
              <Label htmlFor="filename">Nombre del archivo</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="mi-codigo.js"
              />
            </div>
          )}

          {exportFormat === "gist" && (
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Gist</Label>
              <Textarea
                id="description"
                value={gistDescription}
                onChange={(e) => setGistDescription(e.target.value)}
                placeholder="Descripción opcional..."
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            
            {exportFormat === "file" && (
              <Button onClick={downloadAsFile} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            )}
            
            {exportFormat === "gist" && (
              <Button onClick={createGist} className="flex-1">
                <Github className="w-4 h-4 mr-2" />
                Crear Gist
              </Button>
            )}
            
            {exportFormat === "share" && (
              <Button onClick={shareCode} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}