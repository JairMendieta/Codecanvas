"use client";

import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, LoaderCircle, Code2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthContext, UserPlan } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const plans: { name: UserPlan; price: string; period: string; description: string; features: string[]; isPopular: boolean; icon: any; }[] = [
  {
    name: "gratuito",
    price: "0",
    period: "Gratis",
    description: "Perfecto para empezar",
    features: [
      "3 créditos de generación",
      "Análisis de código básico",
      "Historial de conversaciones",
      "Soporte por email",
    ],
    isPopular: false,
    icon: Code2,
  },
  {
    name: "pro",
    price: "5",
    period: "por mes",
    description: "Para desarrolladores profesionales",
    features: [
      "Generaciones ilimitadas",
      "Análisis avanzado de código",
      "Documentación automática",
      "Soporte prioritario",
      "Acceso anticipado a funciones",
      "Exportar conversaciones",
    ],
    isPopular: true,
    icon: Star,
  },
  {
    name: "ultra",
    price: "10",
    period: "por mes",
    description: "Para equipos y uso intensivo",
    features: [
      "Todo lo del plan Pro",
      "Documentación avanzada (API, README, técnica)",
      "Colaboración en equipo",
      "Modelos de IA más potentes",
      "API personalizada",
      "Soporte dedicado",
    ],
    isPopular: false,
    icon: Zap,
  },
];

export default function PricingPage() {
    const { user, userPlan } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<UserPlan | null>(null);
    const { toast } = useToast();
    
    const handleUpdatePlan = async (newPlan: UserPlan) => {
        if (!user) {
             toast({
                title: "Error",
                description: "Debes iniciar sesión para cambiar de plan.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(newPlan);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { plan: newPlan });

            toast({
                title: "¡Plan actualizado!",
                description: `Tu plan ha sido actualizado a ${newPlan}.`,
            });
        } catch (error) {
             toast({
                title: "Error al actualizar",
                description: "No se pudo actualizar el plan. Revisa las reglas de seguridad de Firestore.",
                variant: "destructive",
            });
            console.error("Error updating plan: ", error);
        } finally {
            setIsLoading(null);
        }
    }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg mb-6">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            Planes simples y transparentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades de desarrollo
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = userPlan === plan.name;
            
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border transition-all duration-300 hover:shadow-xl",
                  plan.isPopular 
                    ? "border-primary/30 bg-gradient-to-b from-primary/5 to-background shadow-lg scale-105" 
                    : "border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/20"
                )}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Más Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={cn(
                      "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4",
                      plan.isPopular 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold capitalize mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full h-12 rounded-xl font-medium transition-all duration-200 group",
                      plan.isPopular
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl"
                        : isCurrentPlan
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    )}
                    disabled={isLoading !== null || isCurrentPlan}
                    onClick={() => handleUpdatePlan(plan.name)}
                    variant={plan.isPopular ? "default" : "outline"}
                  >
                    {isLoading === plan.name ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      "Plan Actual"
                    ) : (
                      <>
                        <span>{plan.name === "gratuito" ? "Empezar Gratis" : "Actualizar Plan"}</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg inline-block">
            💡 Las pasarelas de pago se implementarán próximamente
          </p>
        </div>
      </div>
    </div>
  );
}
