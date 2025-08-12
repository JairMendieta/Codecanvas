"use client";

import { useState, useEffect, useCallback } from "react";

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: Date;
  tags: string[];
  isFavorite: boolean;
}

const STORAGE_KEY = "code-canvas-snippets";

export function useCodeHistory() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar snippets del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas de string a Date
        const withDates = parsed.map((snippet: any) => ({
          ...snippet,
          createdAt: new Date(snippet.createdAt)
        }));
        setSnippets(withDates);
      }
    } catch (error) {
      console.error("Error loading code history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar snippets en localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
      } catch (error) {
        console.error("Error saving code history:", error);
      }
    }
  }, [snippets, isLoading]);

  const addSnippet = useCallback((snippet: Omit<CodeSnippet, "id" | "createdAt">) => {
    const newSnippet: CodeSnippet = {
      ...snippet,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setSnippets(prev => [newSnippet, ...prev]);
    return newSnippet.id;
  }, []);

  const deleteSnippet = useCallback((id: string) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setSnippets(prev => prev.map(snippet => 
      snippet.id === id 
        ? { ...snippet, isFavorite: !snippet.isFavorite }
        : snippet
    ));
  }, []);

  const updateSnippet = useCallback((id: string, updates: Partial<CodeSnippet>) => {
    setSnippets(prev => prev.map(snippet => 
      snippet.id === id 
        ? { ...snippet, ...updates }
        : snippet
    ));
  }, []);

  const searchSnippets = useCallback((query: string) => {
    if (!query.trim()) return snippets;
    
    const lowercaseQuery = query.toLowerCase();
    return snippets.filter(snippet => 
      snippet.title.toLowerCase().includes(lowercaseQuery) ||
      snippet.code.toLowerCase().includes(lowercaseQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [snippets]);

  const getSnippetsByLanguage = useCallback((language: string) => {
    return snippets.filter(snippet => snippet.language === language);
  }, [snippets]);

  const getFavorites = useCallback(() => {
    return snippets.filter(snippet => snippet.isFavorite);
  }, [snippets]);

  return {
    snippets,
    isLoading,
    addSnippet,
    deleteSnippet,
    toggleFavorite,
    updateSnippet,
    searchSnippets,
    getSnippetsByLanguage,
    getFavorites,
  };
}