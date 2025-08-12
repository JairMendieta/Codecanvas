"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, LoaderCircle, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';

// Esta función ahora vive aquí para ser llamada directamente desde el lado del cliente tras el registro.
async function createUserInFirestore(uid: string, email: string | null) {
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      email,
      credits: 3,
      plan: 'gratuito', // Asignar plan gratuito por defecto
    });
  } catch (error) {
    console.error("Error creating user document in Firestore: ", error);
    throw new Error("Could not create user document in Firestore.");
  }
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Se llama a la función local para crear el documento en Firestore.
      await createUserInFirestore(userCredential.user.uid, userCredential.user.email);
      router.push('/');
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'El correo electrónico ya está en uso.'
        : "Ocurrió un error inesperado durante el registro.";
      toast({
        title: "Error al registrarse",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg mb-4">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            CodeCanvas AI
          </h1>
          <p className="text-muted-foreground mt-2">
            Crea tu cuenta y empieza a programar con IA
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-200"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres
            </p>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Crear Cuenta</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </Button>
        </form>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <h3 className="text-sm font-medium text-foreground mb-2">
            ✨ Al registrarte obtienes:
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 3 créditos gratuitos para empezar</li>
            <li>• Generación de código con IA</li>
            <li>• Análisis y optimización de código</li>
            <li>• Historial de conversaciones</li>
          </ul>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              ¿Ya tienes cuenta?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full h-12 border border-border/50 hover:border-primary/30 rounded-xl text-sm font-medium text-foreground hover:text-primary transition-all duration-200 hover:bg-primary/5 group"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>
            Al registrarte, aceptas nuestros{' '}
            <Link href="#" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="#" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
