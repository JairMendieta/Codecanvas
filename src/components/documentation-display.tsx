"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompactMarkdown } from "@/components/compact-markdown";
import { GenerateDocumentationOutput } from "@/ai/flows/generate-documentation";

interface DocumentationDisplayProps {
    documentation: GenerateDocumentationOutput;
}

export function DocumentationDisplay({ documentation }: DocumentationDisplayProps) {
    const { toast } = useToast();

    const handleCopyDocumentation = async () => {
        try {
            await navigator.clipboard.writeText(documentation.documentation);
            toast({
                title: "¡Copiado!",
                description: "La documentación ha sido copiada al portapapeles.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo copiar la documentación.",
                variant: "destructive",
            });
        }
    };

    const handleDownloadDocumentation = () => {
        const blob = new Blob([documentation.documentation], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentation.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "¡Descargado!",
            description: `El archivo ${documentation.fileName} ha sido descargado.`,
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-primary" />
                            Documentación Generada
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {documentation.summary}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyDocumentation}
                            className="h-8 px-3"
                        >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadDocumentation}
                            className="h-8 px-3"
                        >
                            <Download className="w-3 h-3 mr-1" />
                            Descargar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="rounded-lg border bg-muted/30 p-4 max-h-[600px] overflow-y-auto">
                    <CompactMarkdown>{documentation.documentation}</CompactMarkdown>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                    Archivo sugerido: <code className="bg-muted px-1 py-0.5 rounded text-xs">{documentation.fileName}</code>
                </div>
            </CardContent>
        </Card>
    );
}