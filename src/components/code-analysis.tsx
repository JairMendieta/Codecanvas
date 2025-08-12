"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb, ShieldAlert, BookText } from "lucide-react";
import { CompactMarkdown } from "@/components/compact-markdown";

interface CodeAnalysisProps {
  explanation: string;
  potentialIssues: string;
  suggestions: string;
}

export function CodeAnalysis({ explanation, potentialIssues, suggestions }: CodeAnalysisProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Análisis de Código</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="explanation">
          <AccordionItem value="explanation">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-medium">
                <BookText className="h-5 w-5 text-primary/80" />
                Explicación
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CompactMarkdown className="pt-2">{explanation}</CompactMarkdown>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="issues">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert className="h-5 w-5 text-primary/80" />
                Posibles Problemas
              </div>
            </AccordionTrigger>
            <AccordionContent>
               <CompactMarkdown className="pt-2">{potentialIssues}</CompactMarkdown>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="suggestions">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-medium">
                <Lightbulb className="h-5 w-5 text-primary/80" />
                Sugerencias
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CompactMarkdown className="pt-2">{suggestions}</CompactMarkdown>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
