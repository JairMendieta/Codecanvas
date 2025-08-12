'use server';

/**
 * @fileOverview Generates code snippets based on user prompts.
 *
 * - generateCodeSnippet - A function that generates code snippets.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippet function.
 * - GenerateCodeSnippetOutput - The return type for the generateCodeSnippet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  prompt: z.string().describe('A description of the code snippet to generate.'),
  framework: z.string().optional().describe('Optional framework or library to use.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation history for context.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

const GenerateCodeSnippetOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
  explanation: z.string().describe('Explanation of the code, in Markdown format.'),
  fileName: z.string().describe('The suggested filename with extension for the code (e.g., "component.tsx", "utils.py", "main.js").'),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippet(input: GenerateCodeSnippetInput): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: { schema: GenerateCodeSnippetInputSchema },
  output: { schema: GenerateCodeSnippetOutputSchema },
  prompt: `Eres un experto desarrollador de software y generador de código. Tu tarea es generar código funcional y completo basado en las instrucciones del usuario.

**INSTRUCCIONES IMPORTANTES**:
1. SIEMPRE responde en español
2. SIEMPRE genera código funcional y completo
3. El código debe estar listo para usar
4. Incluye comentarios en español cuando sea necesario
5. Si no se especifica un lenguaje, elige el más apropiado para la tarea
6. IMPORTANTE: Proporciona un nombre de archivo apropiado con la extensión correcta
7. MEMORIA: Considera el contexto de la conversación anterior para dar respuestas coherentes y relacionadas

{{#if conversationHistory}}
**HISTORIAL DE CONVERSACIÓN PREVIA**:
{{#each conversationHistory}}
{{role}}: {{content}}

{{/each}}
{{/if}}

**NUEVA INSTRUCCIÓN DEL USUARIO**: {{{prompt}}}
{{#if framework}}**Framework/Tecnología**: {{{framework}}}{{/if}}

**CONTEXTO**: Si hay conversación previa, ten en cuenta:
- Modificaciones o mejoras solicitadas al código anterior
- Preferencias de lenguaje o framework mencionadas
- Estilo de código o patrones establecidos
- Funcionalidades relacionadas o extensiones del código previo
- Continúa la conversación de manera natural y coherente

**FORMATO DE RESPUESTA**:
- **code**: El código completo y funcional (modificado, mejorado o nuevo según el contexto)
- **explanation**: Explicación clara en español de lo que hace el código, cambios realizados si es una modificación, y cómo usarlo
- **fileName**: Nombre de archivo descriptivo con la extensión correcta

**Guías para nombres de archivo**:
- Para React/TSX: "ComponentName.tsx"
- Para Python: "module_name.py" 
- Para JavaScript: "script-name.js"
- Para TypeScript: "module-name.ts"
- Para CSS: "styles.css"
- Para HTML: "index.html"
- Para SQL: "database.sql"
- Para Java: "ClassName.java"
- Para C#: "ClassName.cs"
- Usa nombres descriptivos que reflejen la funcionalidad del código`,
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);