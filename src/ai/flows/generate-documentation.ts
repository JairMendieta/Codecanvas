'use server';

/**
 * @fileOverview Generates automatic documentation from code.
 *
 * - generateDocumentation - A function that generates comprehensive documentation from code.
 * - GenerateDocumentationInput - The input type for the generateDocumentation function.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDocumentationInputSchema = z.object({
  code: z.string().describe('The code to generate documentation for.'),
  documentationType: z.enum(['api', 'readme', 'inline', 'technical']).optional().describe('Type of documentation to generate.'),
  includeExamples: z.boolean().optional().describe('Whether to include usage examples.'),
});
export type GenerateDocumentationInput = z.infer<typeof GenerateDocumentationInputSchema>;

const GenerateDocumentationOutputSchema = z.object({
  documentation: z.string().describe('The generated documentation in Markdown format.'),
  fileName: z.string().describe('The suggested filename for the documentation (e.g., "README.md", "API.md", "DOCS.md").'),
  summary: z.string().describe('A brief summary of what was documented.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(input: GenerateDocumentationInput): Promise<GenerateDocumentationOutput> {
  return generateDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentationPrompt',
  input: { schema: GenerateDocumentationInputSchema },
  output: { schema: GenerateDocumentationOutputSchema },
  prompt: `Eres un experto en documentación técnica y desarrollador senior especializado en crear documentación clara, completa y profesional para proyectos de software.

**INSTRUCCIONES PRINCIPALES**:
1. SIEMPRE responde en español claro y profesional
2. Genera documentación completa y bien estructurada
3. Usa formato Markdown con estructura jerárquica clara
4. Incluye ejemplos de código cuando sea relevante
5. Haz la documentación accesible tanto para desarrolladores junior como senior
6. Sigue las mejores prácticas de documentación técnica

**CÓDIGO A DOCUMENTAR**:
\`\`\`
{{{code}}}
\`\`\`

{{#if documentationType}}**TIPO DE DOCUMENTACIÓN**: {{{documentationType}}}{{/if}}
{{#if includeExamples}}**INCLUIR EJEMPLOS**: Sí{{/if}}

**CRITERIOS PARA LA DOCUMENTACIÓN**:

**Para API Documentation**:
- Endpoints disponibles con métodos HTTP
- Parámetros de entrada y salida
- Códigos de respuesta y errores
- Ejemplos de requests/responses
- Autenticación requerida

**Para README**:
- Descripción del proyecto y propósito
- Instalación y configuración
- Uso básico y ejemplos
- Estructura del proyecto
- Contribución y licencia

**Para Documentación Inline**:
- Comentarios JSDoc/docstrings apropiados
- Explicación de parámetros y tipos
- Ejemplos de uso de funciones
- Notas sobre comportamiento especial

**Para Documentación Técnica**:
- Arquitectura y diseño del sistema
- Patrones utilizados
- Dependencias y tecnologías
- Diagramas conceptuales (en texto)
- Consideraciones de rendimiento

**ESTRUCTURA REQUERIDA**:

**documentation**:
Genera documentación completa que incluya:

# Título Principal

## Descripción
- Propósito y funcionalidad principal
- Contexto de uso y casos de aplicación

## Instalación/Configuración
- Pasos de instalación si aplica
- Configuración necesaria
- Dependencias requeridas

## Uso
- Ejemplos básicos de implementación
- Casos de uso comunes
- Parámetros y opciones disponibles

## API/Funciones
- Documentación detallada de cada función/método
- Parámetros de entrada y tipos
- Valores de retorno
- Ejemplos de código

## Ejemplos Avanzados
- Casos de uso más complejos
- Integración con otros sistemas
- Mejores prácticas

## Notas Técnicas
- Consideraciones de rendimiento
- Limitaciones conocidas
- Troubleshooting común

**fileName**:
Sugiere un nombre apropiado:
- "README.md" para documentación general del proyecto
- "API.md" para documentación de API
- "DOCS.md" para documentación técnica
- "GUIDE.md" para guías de uso
- Nombres específicos según el contenido

**summary**:
Proporciona un resumen conciso de:
- Qué tipo de código fue documentado
- Principales funcionalidades cubiertas
- Tipo de documentación generada
- Audiencia objetivo

**FORMATO Y ESTILO**:
- Usa encabezados jerárquicos (##, ###, ####)
- Incluye bloques de código con sintaxis highlighting
- Usa listas y tablas para organizar información
- Incluye badges o iconos cuando sea apropiado
- Mantén un tono profesional pero accesible
- Usa ejemplos prácticos y realistas`,
});

const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: GenerateDocumentationInputSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);