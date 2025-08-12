"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  code: string;
  fileName?: string;
}

export function CodeBlock({ code, fileName = "snippet.js" }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      toast({
        title: "¡Copiado al portapapeles!",
      });
      setTimeout(() => setHasCopied(false), 2000);
    });
  }, [code, toast]);

  const downloadCode = useCallback(() => {
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
    });
  }, [code, fileName, toast]);

  return (
    <Card className="relative bg-muted/30 dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-2 bg-muted/50 dark:bg-zinc-800 h-11">
            <span className="text-xs text-muted-foreground font-mono px-2">{fileName}</span>
            <div className="flex items-center gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={downloadCode}
                    >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Descargar código</span>
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={copyToClipboard}
                >
                    {hasCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copiar código</span>
                </Button>
            </div>
        </div>
      
        <div className="p-4 overflow-x-auto">
            <pre className="font-code text-sm whitespace-pre-wrap">
            <code>{code}</code>
            </pre>
        </div>
    </Card>
  );
}
