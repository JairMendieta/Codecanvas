/**
 * Utilidades para formatear y procesar código
 */

export interface CodeMetadata {
  language: string;
  lineCount: number;
  characterCount: number;
  hasComments: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

/**
 * Detecta el lenguaje de programación basado en el contenido del código
 */
export function detectLanguage(code: string): string {
  const patterns = [
    { language: 'python', regex: /\b(def|class|import|from|for|while|if|else|elif|try|except|finally|with|as|return|lambda)\b/ },
    { language: 'javascript', regex: /\b(function|const|let|var|import|export|class|=>)\b/ },
    { language: 'typescript', regex: /\b(interface|type|enum|namespace|declare)\b|:\s*(string|number|boolean|any)/ },
    { language: 'react', regex: /<[A-Z][a-zA-Z0-9]*|import.*from\s+['"]react['"]/ },
    { language: 'java', regex: /\b(public|private|protected|class|import|void|int|String|System\.out\.println)\b/ },
    { language: 'cpp', regex: /\b(#include|using namespace|cout|cin|int main)\b/ },
    { language: 'html', regex: /<html|<head|<body|<div|<span|<p|<!DOCTYPE/ },
    { language: 'css', regex: /\{[^}]*\}|@media|@import|@keyframes/ },
    { language: 'sql', regex: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i },
    { language: 'json', regex: /^\s*\{[\s\S]*\}\s*$|^\s*\[[\s\S]*\]\s*$/ },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(code)) {
      return pattern.language;
    }
  }

  return 'text';
}

/**
 * Obtiene la extensión de archivo apropiada para un lenguaje
 */
export function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    html: 'html',
    css: 'css',
    sql: 'sql',
    react: 'jsx',
    json: 'json',
    text: 'txt',
  };

  return extensions[language] || 'txt';
}

/**
 * Analiza las características del código
 */
export function analyzeCode(code: string): CodeMetadata {
  const lines = code.split('\n');
  const lineCount = lines.length;
  const characterCount = code.length;
  
  // Detectar comentarios
  const hasComments = /\/\/|\/\*|\*\/|#|<!--/.test(code);
  
  // Calcular complejidad básica
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  
  if (lineCount > 100 || /\b(class|function|def|for|while|if)\b/g.test(code)) {
    complexity = 'medium';
  }
  
  if (lineCount > 200 || (code.match(/\b(class|function|def)\b/g) || []).length > 5) {
    complexity = 'complex';
  }

  return {
    language: detectLanguage(code),
    lineCount,
    characterCount,
    hasComments,
    complexity,
  };
}

/**
 * Formatea código básico (indentación)
 */
export function formatCode(code: string, language: string): string {
  // Formateo básico por lenguaje
  switch (language) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(code), null, 2);
      } catch {
        return code;
      }
    
    case 'html':
      return formatHTML(code);
    
    default:
      return formatGeneric(code);
  }
}

/**
 * Formateo básico para HTML
 */
function formatHTML(html: string): string {
  let formatted = html;
  let indent = 0;
  const tab = '  ';
  
  formatted = formatted.replace(/></g, '>\n<');
  
  const lines = formatted.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }
    
    result.push(tab.repeat(indent) + trimmed);
    
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indent++;
    }
  }
  
  return result.join('\n');
}

/**
 * Formateo genérico (solo indentación básica)
 */
function formatGeneric(code: string): string {
  const lines = code.split('\n');
  let indent = 0;
  const tab = '  ';
  const result: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
      continue;
    }
    
    // Reducir indentación para llaves de cierre
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }
    
    result.push(tab.repeat(indent) + trimmed);
    
    // Aumentar indentación después de llaves de apertura
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indent++;
    }
  }
  
  return result.join('\n');
}

/**
 * Extrae funciones/métodos del código
 */
export function extractFunctions(code: string, language: string): string[] {
  const functions: string[] = [];
  
  switch (language) {
    case 'javascript':
    case 'typescript':
      const jsRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*function)/g;
      let match;
      while ((match = jsRegex.exec(code)) !== null) {
        functions.push(match[1] || match[2] || match[3]);
      }
      break;
      
    case 'python':
      const pyRegex = /def\s+(\w+)/g;
      let pyMatch;
      while ((pyMatch = pyRegex.exec(code)) !== null) {
        functions.push(pyMatch[1]);
      }
      break;
      
    case 'java':
      const javaRegex = /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g;
      let javaMatch;
      while ((javaMatch = javaRegex.exec(code)) !== null) {
        functions.push(javaMatch[1]);
      }
      break;
  }
  
  return functions;
}