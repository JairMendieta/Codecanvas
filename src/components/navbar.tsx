
"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code2, LoaderCircle } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';

export function Navbar() {
  const { user, loading } = useContext(AuthContext);

  return (
    <header className="w-full bg-background">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            CodeCanvas AI
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4">
          {loading ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : !user && (
            <nav className="flex gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
