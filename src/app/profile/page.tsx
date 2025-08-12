"use client";

import { useState, useEffect, useContext } from 'react';
import { User, updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { 
  Code2, 
  LoaderCircle, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Save,
  Settings,
  Activity,
  Calendar,
  Shield,
  Camera,
  Edit3,
  ArrowLeft,
  Check,
  LogOut,
  Crown,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { logout } from '@/services/auth-service';

export default function ProfilePage() {
  const { user, userPlan, userCredits } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'activity' | 'plan'>('profile');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile(user, {
        displayName: displayName
      });
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      id: 'profile' as const,
      label: 'Información Personal',
      icon: UserIcon,
      description: 'Gestiona tu información básica'
    },
    {
      id: 'plan' as const,
      label: 'Plan y Facturación',
      icon: Crown,
      description: 'Tu plan actual y opciones de upgrade'
    },
    {
      id: 'security' as const,
      label: 'Seguridad',
      icon: Shield,
      description: 'Contraseña y configuración de seguridad'
    },
    {
      id: 'activity' as const,
      label: 'Actividad',
      icon: Activity,
      description: 'Historial de tu cuenta'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative">
        {/* Header */}
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="hover:bg-muted/50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">Mi Perfil</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tu cuenta de CodeCanvas AI</p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                {isLoggingOut ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary/10 border border-primary/20 text-primary'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Header */}
              <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-primary/20">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Usuario'} />
                      <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-white">
                        {getInitials(user.displayName || user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary hover:bg-primary/90 shadow-lg p-0"
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {user.displayName || 'Usuario'}
                    </h2>
                    <p className="text-muted-foreground mb-4 flex items-center justify-center sm:justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                      <Badge variant="outline" className="border-border/50">
                        <Calendar className="w-3 h-3 mr-1" />
                        Desde {new Date(user.metadata.creationTime || '').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              {activeSection === 'profile' && (
                <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Información Personal</h3>
                    <p className="text-muted-foreground text-sm">Actualiza tu información básica de perfil</p>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                          Nombre completo
                        </label>
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-11 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          Correo electrónico
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="h-11 bg-muted/30 border-border/30 rounded-lg text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground">
                          El correo electrónico no se puede modificar
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="px-6 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'plan' && (
                <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Plan y Facturación</h3>
                    <p className="text-muted-foreground text-sm">Información sobre tu plan actual y opciones de upgrade</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground capitalize">
                              Plan {userPlan || 'Gratuito'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {userPlan === 'gratuito' 
                                ? 'Plan básico con funciones limitadas'
                                : userPlan === 'pro'
                                ? 'Plan profesional con funciones avanzadas'
                                : 'Plan premium con acceso completo'
                              }
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={userPlan === 'gratuito' ? 'secondary' : 'default'}
                          className={
                            userPlan === 'gratuito' 
                              ? 'bg-muted text-muted-foreground'
                              : userPlan === 'pro'
                              ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                          }
                        >
                          {userPlan === 'gratuito' ? 'Gratuito' : userPlan === 'pro' ? 'Pro' : 'Ultra'}
                        </Badge>
                      </div>
                      
                      {userPlan === 'gratuito' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <CreditCard className="w-4 h-4" />
                          <span>Créditos restantes: {userCredits}</span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Generación de código</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Análisis de código</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {userPlan !== 'gratuito' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className={userPlan === 'gratuito' ? 'text-muted-foreground' : ''}>
                            Documentación automática
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Upgrade Options */}
                    {userPlan === 'gratuito' && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">¿Listo para más?</h4>
                            <p className="text-sm text-muted-foreground">
                              Desbloquea todas las funciones con un plan premium
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => router.push('/pricing')}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Ver Planes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push('/pricing')}
                            className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            Comparar Funciones
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/20 border border-border/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Code2 className="w-5 h-5 text-primary" />
                          <span className="font-medium text-foreground">Código Generado</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">-</p>
                        <p className="text-xs text-muted-foreground">Snippets este mes</p>
                      </div>
                      
                      <div className="bg-muted/20 border border-border/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-foreground">Análisis Realizados</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">-</p>
                        <p className="text-xs text-muted-foreground">Análisis este mes</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Seguridad de la Cuenta</h3>
                    <p className="text-muted-foreground text-sm">Mantén tu cuenta segura actualizando tu contraseña</p>
                  </div>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                          Nueva contraseña
                        </label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                          Confirmar contraseña
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex gap-3">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Recomendaciones de seguridad
                          </p>
                          <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                            <li>• Usa al menos 8 caracteres</li>
                            <li>• Incluye mayúsculas, minúsculas y números</li>
                            <li>• Evita información personal</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="px-6 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        disabled={isPasswordLoading}
                      >
                        {isPasswordLoading ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Actualizar Contraseña
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'activity' && (
                <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Actividad de la Cuenta</h3>
                    <p className="text-muted-foreground text-sm">Revisa el historial de actividad de tu cuenta</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Cuenta creada</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.metadata.creationTime || '').toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Último acceso</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.metadata.lastSignInTime || '').toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}