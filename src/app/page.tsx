"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { analyzeCode, AnalyzeCodeOutput } from "@/ai/flows/analyze-code";
import { generateCodeSnippet } from "@/ai/flows/generate-code-snippet";
import { generateDocumentation, GenerateDocumentationOutput } from "@/ai/flows/generate-documentation";
import { Code2, FileClock, LoaderCircle, LogOut, Plus, SendHorizonal, Trash2, User, Video, Crown, Search, Bot, UserCircle, FileText, Settings } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { CodeAnalysis } from "@/components/code-analysis";
import { DocumentationDisplay } from "@/components/documentation-display";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarInset,

  SidebarFooter
} from "@/components/ui/sidebar";
import { AuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth-service";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompactMarkdown } from "@/components/compact-markdown";


type Message = {
  id: string;
  role: 'user' | 'assistant';
  type: 'generate' | 'analyze' | 'document';
  // User's input
  prompt: string; // For generation, user's prompt. For analysis, the code to analyze.
  // Assistant's output
  code?: string;
  explanation?: string;
  fileName?: string; // For generated code
  analysis?: AnalyzeCodeOutput;
  documentation?: GenerateDocumentationOutput;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};


// Enhanced function to detect the programming language from code snippet
const detectLanguage = (code: string): string => {
  const codeStr = code.toLowerCase();

  // Check for TypeScript/TSX (must be before JS/JSX)
  if ((/\b(interface|type|enum|namespace|declare|as\s+\w+)\b/.test(codeStr) ||
    /:\s*(string|number|boolean|object|any|void|never|unknown)\b/.test(codeStr) ||
    /<[a-zA-Z]/.test(code)) &&
    (/\b(import|export|const|let|var|function|class)\b/.test(codeStr))) {
    if (/<[a-zA-Z]/.test(code)) {
      return 'tsx';
    }
    return 'ts';
  }

  // Check for React/JSX (must be before regular JS)
  if (/<[a-zA-Z]/.test(code) && (/\b(react|component|jsx|props|state)\b/.test(codeStr) ||
    /\b(import|export|const|let|var|function)\b/.test(codeStr))) {
    return 'jsx';
  }

  // Check for Python
  if (/\b(def|class|import|from|elif|except|finally|with|lambda|print|len|range|str|int|float|list|dict|tuple)\b/.test(codeStr) ||
    /^\s*#/.test(code) || /:\s*$/.test(code.split('\n')[0])) {
    return 'py';
  }

  // Check for JavaScript/Node.js
  if (/\b(function|const|let|var|import|export|require|module\.exports|console\.log|=>|async|await)\b/.test(codeStr)) {
    return 'js';
  }

  // Check for Java
  if (/\b(public|private|protected|static|void|int|string|boolean|class|interface|extends|implements|system\.out\.println)\b/.test(codeStr) ||
    /\bclass\s+\w+\s*\{/.test(code)) {
    return 'java';
  }

  // Check for C#
  if (/\b(using|namespace|public|private|static|void|int|string|bool|class|interface|var|console\.writeline)\b/.test(codeStr) ||
    /\busing\s+system/i.test(code)) {
    return 'cs';
  }

  // Check for C/C++
  if (/\b(#include|int\s+main|printf|cout|cin|std::|iostream|stdio\.h)\b/.test(codeStr)) {
    if (/\b(cout|cin|std::|iostream|class|template|namespace)\b/.test(codeStr)) {
      return 'cpp';
    }
    return 'c';
  }

  // Check for PHP
  if (/^<\?php|\$\w+|echo\s+|print\s+|\bfunction\s+\w+\s*\(/i.test(code)) {
    return 'php';
  }

  // Check for Ruby
  if (/\b(def|end|class|module|require|puts|print|attr_accessor|attr_reader|attr_writer)\b/.test(codeStr)) {
    return 'rb';
  }

  // Check for Go
  if (/\b(package|import|func|var|const|type|struct|interface|go|fmt\.print)\b/.test(codeStr)) {
    return 'go';
  }

  // Check for Rust
  if (/\b(fn|let|mut|struct|enum|impl|trait|use|mod|pub|println!|vec!)\b/.test(codeStr)) {
    return 'rs';
  }

  // Check for SQL
  if (/\b(select|insert|update|delete|create|drop|alter|table|database|from|where|join|group\s+by|order\s+by)\b/.test(codeStr)) {
    return 'sql';
  }

  // Check for CSS
  if (/\{[^}]*\}/.test(code) && /[.#]?\w+\s*\{/.test(code) &&
    /\b(color|background|margin|padding|border|font|width|height|display|position)\b/.test(codeStr)) {
    return 'css';
  }

  // Check for HTML
  if (/<html|<head|<body|<div|<span|<p|<h[1-6]|<a|<img|<ul|<li|<table|<form/.test(codeStr)) {
    return 'html';
  }

  // Check for JSON
  if (/^\s*[\{\[]/.test(code) && /[\}\]]\s*$/.test(code) &&
    /"[^"]*"\s*:\s*/.test(code)) {
    return 'json';
  }

  // Check for XML
  if (/<\?xml|<\w+[^>]*>.*<\/\w+>/.test(code)) {
    return 'xml';
  }

  // Check for YAML
  if (/^\s*\w+:\s*/.test(code) && !/\{|\}|\[|\]/.test(code)) {
    return 'yaml';
  }

  // Check for Markdown
  if (/^#+\s+|\*\*.*\*\*|\*.*\*|`.*`|\[.*\]\(.*\)/.test(code)) {
    return 'md';
  }

  // Check for Shell/Bash
  if (/^#!/.test(code) || /\b(echo|ls|cd|mkdir|rm|cp|mv|grep|awk|sed|chmod)\b/.test(codeStr)) {
    return 'sh';
  }

  // Default fallback
  return 'txt';
};

const getFileName = (code: string) => {
  const extension = detectLanguage(code);
  return `snippet.${extension}`;
}

function HomeComponent() {
  const [history, setHistory] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [codeToAnalyze, setCodeToAnalyze] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze' | 'document'>('generate');
  const [codeToDocument, setCodeToDocument] = useState("");
  const { user, loading, userPlan, userCredits } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  // Configuración de modos disponibles
  const modes = [
    {
      id: 'generate' as const,
      label: 'Generar código',
      icon: Bot,
      available: true,
    },
    {
      id: 'analyze' as const,
      label: 'Analizar código',
      icon: Search,
      available: true,
    },
    {
      id: 'document' as const,
      label: 'Generar documentación',
      icon: FileText,
      available: userPlan !== 'gratuito',
      premiumFeature: true,
    },
  ];

  const availableModes = modes.filter(mode => mode.available);
  const activeMode = modes.find(mode => mode.id === activeTab);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("code-canvas-history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("code-canvas-history", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const activeConversation = useMemo(() => {
    return history.find((conv) => conv.id === activeId) || null;
  }, [activeId, history]);


  const handleNewConversation = () => {
    setActiveId(null);
    setPrompt("");
    setCodeToAnalyze("");
    setCodeToDocument("");
  };

  const handleSelectHistory = (id: string) => {
    setActiveId(id);
    setPrompt("");
    setCodeToAnalyze("");
    setCodeToDocument("");
  };

  const handleDeleteHistory = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== idToDelete));
    if (activeId === idToDelete) {
      handleNewConversation();
    }
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  const handleWatchAd = async () => {
    if (!user || isWatchingAd) return;
    setIsWatchingAd(true);
    toast({
      title: "Viendo anuncio...",
      description: "Ganarás +1 crédito después de que termine el anuncio.",
    })

    // Simulate watching an ad
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        credits: increment(1)
      });
      // The onSnapshot listener in AuthContext will update the credits
      toast({
        title: "¡Crédito añadido!",
        description: "Has recibido +1 crédito.",
      })
    } catch (error: any) {
      console.error("Error adding credit:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el crédito. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsWatchingAd(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !user) return;

    const getActionForSubmit = () => {
      if (activeConversation) {
        // For follow-up messages, we assume 'generate' to allow conversational replies.
        // Or you can get the original type: activeConversation.messages[0].type;
        return 'generate';
      }
      return activeTab;
    }
    const action = getActionForSubmit();

    const currentInput = action === 'generate' ? prompt : action === 'analyze' ? codeToAnalyze : codeToDocument;

    if (!currentInput.trim()) {
      return; // Don't submit empty inputs
    }

    // Check if user has access to documentation feature
    if (action === 'document' && userPlan === 'gratuito') {
      toast({
        title: "Función Premium",
        description: "La documentación automática está disponible solo para usuarios Pro y Ultra. Actualiza tu plan para acceder.",
        variant: "destructive"
      });
      return;
    }

    if (userPlan === 'gratuito' && userCredits <= 0) {
      toast({
        title: "No tienes créditos",
        description: `No te quedan créditos para ${action === 'generate' ? 'generar' : action === 'analyze' ? 'analizar' : 'documentar'} más código. Mira un anuncio para ganar más.`,
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: action,
      prompt: currentInput,
    };

    // Clear input fields immediately
    setPrompt("");
    setCodeToAnalyze("");
    setCodeToDocument("");

    let currentConversationId = activeId;

    // Add user message immediately and start loading
    if (activeConversation) {
      setHistory(prev => prev.map(conv => {
        if (conv.id === activeId) {
          return { ...conv, messages: [...conv.messages, userMessage] };
        }
        return conv;
      }));
    } else {
      // Create a new conversation with just the user message
      const newConversationId = Date.now().toString();
      const newConversation: Conversation = {
        id: newConversationId,
        title: currentInput.substring(0, 40) + "...",
        messages: [userMessage]
      };
      setHistory(prev => [newConversation, ...prev]);
      setActiveId(newConversationId);
      currentConversationId = newConversationId;
    }

    setIsLoading(true);

    try {
      if (userPlan === 'gratuito') {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { credits: increment(-1) });
      }

      let assistantResponse: Omit<Message, 'id' | 'role' | 'prompt'>;

      if (action === 'generate') {
        // Prepare conversation history for context
        const conversationHistory = activeConversation ?
          activeConversation.messages.map(msg => ({
            role: msg.role,
            content: msg.role === 'user' ? msg.prompt :
              (msg.explanation || '') + (msg.code ? `\n\nCódigo generado:\n${msg.code}` : '')
          })) : [];

        const { code, explanation, fileName } = await generateCodeSnippet({
          prompt: currentInput,
          conversationHistory
        });
        assistantResponse = { type: 'generate', code, explanation, fileName };
      } else if (action === 'analyze') {
        const analysis = await analyzeCode({ code: currentInput });
        assistantResponse = { type: 'analyze', code: currentInput, analysis };
      } else { // document
        const documentation = await generateDocumentation({ 
          code: currentInput,
          documentationType: 'technical',
          includeExamples: true
        });
        assistantResponse = { type: 'document', code: currentInput, documentation };
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        prompt: currentInput,
        ...assistantResponse
      };

      // Add assistant message to the conversation
      setHistory(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return { ...conv, messages: [...conv.messages, assistantMessage] };
        }
        return conv;
      }));

    } catch (error: any) {
      console.error("An error occurred during operation:", error);

      if (user && userPlan === 'gratuito') {
        // Restore credit on error
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { credits: increment(1) });
      }

      toast({
        title: `Error al ${action === 'generate' ? 'generar' : action === 'analyze' ? 'analizar' : 'documentar'} código`,
        description: "Ocurrió un error inesperado.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false);
    }
  };


  const isOutOfCredits = userPlan === 'gratuito' && userCredits <= 0;

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="space-y-6 max-w-lg">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            ¡Hola! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Soy tu asistente de IA para programación
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            {activeTab === 'generate'
              ? "Puedo ayudarte a generar código funcional. Solo describe lo que necesitas y yo me encargo del resto."
              : activeTab === 'analyze'
              ? "Puedo analizar tu código y darte sugerencias para mejorarlo. Pega tu código abajo y empezamos."
              : "Puedo generar documentación completa para tu código. Pega tu código y obtén documentación profesional al instante."
            }
          </p>

          <div className="text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg">
            {activeTab === 'generate'
              ? `💡 Ejemplo: "Crea un componente React para mostrar una lista de tareas"`
              : activeTab === 'analyze'
              ? "💡 Pega cualquier código y te ayudo a optimizarlo"
              : "💡 Pega tu código y obtén README, documentación de API o guías técnicas"
            }
          </div>

          {activeTab === 'document' && userPlan === 'gratuito' && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Función Premium</span>
              </div>
              <p className="mt-1">La documentación automática está disponible solo para usuarios Pro y Ultra.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const NoCreditsScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Alert className="max-w-md">
        <Video className="h-4 w-4" />
        <AlertTitle>¡Ya no tienes créditos!</AlertTitle>
        <AlertDescription className="flex flex-col items-center gap-4 mt-2">
          <p>Mira un anuncio para obtener +1 crédito o actualiza tu plan para tener créditos ilimitados.</p>
          <div className="flex gap-2">
            <Button onClick={handleWatchAd} disabled={isWatchingAd}>
              {isWatchingAd ? <LoaderCircle className="animate-spin" /> : <><Video className="mr-2 h-4 w-4" /> Ver anuncio (+1 crédito)</>}
            </Button>
            <Button variant="outline" onClick={() => router.push('/pricing')}>
              <Crown className="mr-2 h-4 w-4" /> Ver planes
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderInputArea = () => {
    if (activeConversation) {
      const inputPlaceholder = 'Pide una modificación o haz otra pregunta...';
      return (
        <div className="flex items-end gap-2">
          <div className="flex-1 p-3 border rounded-[10px] bg-background">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full min-h-[40px] max-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isOutOfCredits || isLoading}
              style={{
                height: 'auto',
                minHeight: '40px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <Button
            onClick={(e) => handleSubmit(e)}
            size="icon"
            className="h-12 w-12 rounded-[10px] shrink-0"
            disabled={isLoading || !prompt.trim() || isOutOfCredits}
          >
            {isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
          </Button>
        </div>
      )
    }

    // New conversation -> show input with action buttons
    const currentInput = activeTab === 'generate' ? prompt : activeTab === 'analyze' ? codeToAnalyze : codeToDocument;
    const placeholder = activeTab === 'generate'
      ? "Describe el código que quieres generar..."
      : activeTab === 'analyze'
      ? "Pega tu código aquí para analizarlo..."
      : "Pega tu código aquí para generar documentación...";

    return (
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-end p-3 border rounded-[10px] bg-background">
          <Textarea
            value={currentInput}
            onChange={(e) => {
              if (activeTab === 'generate') {
                setPrompt(e.target.value);
              } else if (activeTab === 'analyze') {
                setCodeToAnalyze(e.target.value);
              } else {
                setCodeToDocument(e.target.value);
              }
            }}
            placeholder={placeholder}
            className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
            rows={activeTab === 'generate' ? 1 : 3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isOutOfCredits || isLoading}
            style={{
              height: 'auto',
              minHeight: activeTab === 'generate' ? '40px' : '80px',
              maxHeight: activeTab === 'generate' ? '120px' : '200px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              const maxHeight = activeTab === 'generate' ? 120 : 200;
              target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
            }}
          />
          <div className="border-l ml-3 pl-3 flex items-center gap-1 shrink-0">
            {availableModes.length <= 2 ? (
              // Mostrar botones individuales cuando hay 2 o menos modos
              availableModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    type="button"
                    size="icon"
                    variant={activeTab === mode.id ? 'default' : 'ghost'}
                    className="h-8 w-8 rounded-[10px]"
                    onClick={() => setActiveTab(mode.id)}
                    disabled={isLoading}
                    title={mode.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Button>
                );
              })
            ) : (
              // Mostrar dropdown cuando hay más de 2 modos
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant={activeMode && modes.some(m => m.id === activeTab && m.available) ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-[10px]"
                    disabled={isLoading}
                    title={activeMode?.label}
                  >
                    {activeMode && <activeMode.icon className="w-4 h-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-2">
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Seleccionar modo
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <div className="space-y-1">
                    {modes.map((mode) => {
                      const IconComponent = mode.icon;
                      const isDisabled = !mode.available;
                      const isActive = activeTab === mode.id;
                      return (
                        <DropdownMenuItem
                          key={mode.id}
                          onClick={() => !isDisabled && setActiveTab(mode.id)}
                          disabled={isDisabled}
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-colors ${
                            isActive ? 'bg-primary/10 text-primary' : ''
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'}`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{mode.label}</div>
                            {mode.premiumFeature && !mode.available && (
                              <div className="text-xs text-muted-foreground mt-0.5">Solo Pro/Ultra</div>
                            )}
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <Button
          onClick={(e) => handleSubmit(e)}
          size="icon"
          className="h-12 w-12 rounded-[10px] shrink-0"
          disabled={isLoading || !currentInput.trim() || isOutOfCredits}
        >
          {isLoading ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizonal className="w-5 h-5" />
          )}
        </Button>
      </div>
    );
  };

  const UserMessageCard = ({ message }: { message: Message }) => (
    <div className="flex items-start gap-4">
      <Avatar className="w-8 h-8 border">
        <AvatarFallback><UserCircle className="w-5 h-5" /></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">Tú</p>
        <div className="mt-1 rounded-md bg-muted/30 p-3">
          <pre className="whitespace-pre-wrap font-sans text-sm">{message.prompt}</pre>
        </div>
      </div>
    </div>
  );

  const AssistantMessageCard = ({ message }: { message: Message }) => {
    if (!message.code && !message.explanation && !message.analysis && !message.documentation) return null;
    return (
      <div className="flex items-start gap-4">
        <Avatar className="w-8 h-8 border bg-primary">
          <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <p className="font-semibold">Assistant</p>
          {message.type === 'generate' && message.explanation && (
            <CompactMarkdown>{message.explanation}</CompactMarkdown>
          )}
          {message.type === 'generate' && message.code && (
            <CodeBlock code={message.code} fileName={message.fileName || 'snippet.txt'} />
          )}
          {message.type === 'analyze' && message.code && (
            <CodeBlock code={message.code} fileName={getFileName(message.code)} />
          )}
          {message.type === 'analyze' && message.analysis && (
            <CodeAnalysis
              explanation={message.analysis.explanation}
              potentialIssues={message.analysis.potentialIssues}
              suggestions={message.analysis.suggestions}
            />
          )}
          {message.type === 'document' && message.code && (
            <CodeBlock code={message.code} fileName={getFileName(message.code)} />
          )}
          {message.type === 'document' && message.documentation && (
            <DocumentationDisplay documentation={message.documentation} />
          )}
        </div>
      </div>
    );
  };


  return (
    <SidebarProvider>
      <Sidebar className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold">CodeCanvas AI</h1>
                <p className="text-xs text-muted-foreground">Asistente de IA</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={handleNewConversation}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Nueva conversación</span>
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          {history.length > 0 ? (
            <>
              <div className="px-3 py-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <FileClock className="w-3 h-3" />
                  <span>Historial</span>
                </div>
              </div>
              <SidebarMenu className="space-y-1">
                {history.map((conv) => (
                  <SidebarMenuItem key={conv.id}>
                    <SidebarMenuButton
                      onClick={() => handleSelectHistory(conv.id)}
                      isActive={activeId === conv.id}
                      className={`
                        group relative rounded-lg px-3 py-2.5 text-sm transition-all duration-200
                        ${activeId === conv.id
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${activeId === conv.id ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`} />
                        <span className="truncate font-medium">{conv.title}</span>
                      </div>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      showOnHover
                      onClick={(e) => handleDeleteHistory(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive rounded-md"
                    >
                      <Trash2 className="w-3 h-3" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </>
          ) : (
            <div className="px-3 py-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                  <FileClock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Sin conversaciones</p>
                  <p className="text-xs text-muted-foreground/70">Inicia una nueva conversación para comenzar</p>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t bg-muted/20 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium truncate w-full">{user.email}</span>
                  <div className="flex items-center gap-2">
                    {userPlan === 'gratuito' ? (
                      <span className="text-xs text-muted-foreground">
                        {userCredits} créditos
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-semibold uppercase">
                        {userPlan}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end">
              <DropdownMenuLabel className="font-medium">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="focus:bg-primary/10 focus:text-primary"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {userPlan === 'gratuito' && (
                <DropdownMenuItem
                  onClick={handleWatchAd}
                  disabled={isWatchingAd}
                  className="focus:bg-primary/10 focus:text-primary"
                >
                  {isWatchingAd ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="mr-2 h-4 w-4" />
                  )}
                  <span>Ver anuncio (+1 crédito)</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => router.push('/pricing')}
                className="focus:bg-yellow-500/10 focus:text-yellow-600"
              >
                <Crown className="mr-2 h-4 w-4" />
                <span>Actualizar plan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col h-[calc(100vh)]">
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          {isLoading && activeConversation?.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">{activeTab === 'generate' ? 'Generando...' : activeTab === 'analyze' ? 'Analizando código...' : 'Generando documentación...'}</p>
            </div>
          )}
          {!activeConversation && !isLoading && !isOutOfCredits ? (
            <WelcomeScreen />
          ) : isOutOfCredits && !activeConversation && !isLoading ? (
            <NoCreditsScreen />
          ) : (
            activeConversation && (
              <div className="space-y-8 max-w-4xl mx-auto">
                {activeConversation.messages.map(message =>
                  message.role === 'user'
                    ? <UserMessageCard key={message.id} message={message} />
                    : <AssistantMessageCard key={message.id} message={message} />
                )}
                {isLoading && activeConversation && (
                  <div className="flex items-start gap-4">
                    <Avatar className="w-8 h-8 border bg-primary">
                      <AvatarFallback><Bot className="w-5 h-5 animate-pulse" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <p className="font-semibold">Assistant</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-muted-foreground italic">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-2xl mx-auto">
            {renderInputArea()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <HomeComponent />
  )
}
