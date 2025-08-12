// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Provides functionality to analyze code.
 *
 * analyzeCode - Analyzes the given code and returns an explanation, potential issues, and suggestions for improvement.
 * AnalyzeCodeInput - The input type for the analyzeCode function.
 * AnalyzeCodeOutput - The return type for the analyzeCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code to analyze.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

const AnalyzeCodeOutputSchema = z.object({
  explanation: z
    .string()
    .describe('An explanation of the code functionality, in Markdown format.'),
  potentialIssues: z
    .string()
    .describe('Potential issues in the code, in Markdown format.'),
  suggestions: z
    .string()
    .describe('Suggestions for improving the code, in Markdown format.'),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;

export async function analyzeCode(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
  return analyzeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCodePrompt',
  input: { schema: AnalyzeCodeInputSchema },
  output: { schema: AnalyzeCodeOutputSchema },
  prompt: `Eres un experto desarrollador senior con más de 10 años de experiencia en múltiples lenguajes de programación. Tu especialidad es realizar revisiones de código exhaustivas y proporcionar retroalimentación constructiva.

**INSTRUCCIONES PRINCIPALES**:
1. SIEMPRE responde en español claro y profesional
2. Analiza el código desde múltiples perspectivas: funcionalidad, rendimiento, seguridad, mantenibilidad
3. Usa formato Markdown con listas, negritas y código para mejorar la legibilidad
4. Proporciona ejemplos de código mejorado cuando sea relevante
5. Sé constructivo y educativo en tus comentarios

**CÓDIGO A ANALIZAR**:
\`\`\`
{{{code}}}
\`\`\`

**CRITERIOS DE ANÁLISIS**:
- **Funcionalidad**: ¿El código hace lo que debería hacer?
- **Legibilidad**: ¿Es fácil de entender y mantener?
- **Rendimiento**: ¿Hay optimizaciones posibles?
- **Seguridad**: ¿Existen vulnerabilidades o riesgos?
- **Mejores prácticas**: ¿Sigue las convenciones del lenguaje?
- **Escalabilidad**: ¿Funcionará bien con más datos/usuarios?
- **Testing**: ¿Es fácil de probar?

**FORMATO DE RESPUESTA REQUERIDO**:

**explanation**: 
Proporciona un análisis completo que incluya:
- Resumen de qué hace el código y su propósito principal
- Explicación del flujo de ejecución paso a paso
- Identificación del lenguaje/framework y patrones utilizados
- Evaluación de la arquitectura y diseño general
- Comentarios sobre la legibilidad y estructura del código

**potentialIssues**:
Identifica y explica detalladamente:
- **Errores de lógica** o bugs potenciales
- **Vulnerabilidades de seguridad** (inyección SQL, XSS, etc.)
- **Problemas de rendimiento** (consultas N+1, loops ineficientes, etc.)
- **Memory leaks** o gestión incorrecta de recursos
- **Malas prácticas** del lenguaje o framework
- **Código duplicado** o violaciones DRY
- **Falta de validación** de entrada o manejo de errores
- **Problemas de concurrencia** si aplica

**suggestions**:
Proporciona recomendaciones específicas y accionables:
- **Refactoring** con ejemplos de código mejorado
- **Optimizaciones de rendimiento** con técnicas específicas
- **Mejoras de seguridad** con implementaciones concretas
- **Patrones de diseño** que podrían aplicarse
- **Herramientas o librerías** que podrían ayudar
- **Mejores prácticas** del ecosistema del lenguaje
- **Estrategias de testing** recomendadas
- **Documentación** que debería agregarse

**EJEMPLO DE FORMATO**:
- Usa **negritas** para destacar conceptos importantes
- Usa listas con viñetas para organizar información
- Incluye \`código inline\` para referencias específicas
- Usa bloques de código para ejemplos de mejoras
- Numera las recomendaciones cuando sea apropiado`,
});

const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeFlow',
    inputSchema: AnalyzeCodeInputSchema,
    outputSchema: AnalyzeCodeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
