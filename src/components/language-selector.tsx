"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Check } from "lucide-react";

interface LanguageSelectorProps {
    onLanguageSelect: (language: string) => void;
    selectedLanguage?: string;
}

const POPULAR_LANGUAGES = [
    { name: "JavaScript", code: "javascript", color: "bg-yellow-500" },
    { name: "TypeScript", code: "typescript", color: "bg-blue-500" },
    { name: "Python", code: "python", color: "bg-green-500" },
    { name: "React", code: "react", color: "bg-cyan-500" },
    { name: "Java", code: "java", color: "bg-orange-500" },
    { name: "C++", code: "cpp", color: "bg-purple-500" },
    { name: "HTML/CSS", code: "html", color: "bg-red-500" },
    { name: "SQL", code: "sql", color: "bg-gray-500" },
];

export function LanguageSelector({ onLanguageSelect, selectedLanguage }: LanguageSelectorProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Selecciona el lenguaje
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {POPULAR_LANGUAGES.map((lang) => (
                        <Button
                            key={lang.code}
                            variant={selectedLanguage === lang.code ? "default" : "outline"}
                            className="justify-start gap-2 h-auto p-3"
                            onClick={() => onLanguageSelect(lang.code)}
                        >
                            <div className={`w-3 h-3 rounded-full ${lang.color}`} />
                            <span className="text-sm">{lang.name}</span>
                            {selectedLanguage === lang.code && (
                                <Check className="w-4 h-4 ml-auto" />
                            )}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}