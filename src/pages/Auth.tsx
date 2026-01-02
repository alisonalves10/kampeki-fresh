import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronLeft, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(15),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  // Removed automatic redirect - users should stay on auth page unless they explicitly login/signup

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    setIsHandlingAuth(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Erro ao entrar",
              description: "Email ou senha incorretos",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Erro ao entrar",
              description: error.message,
              variant: "destructive"
            });
          }
          setIsHandlingAuth(false);
        } else {
          setJustSignedUp(false);
          setIsHandlingAuth(false);
          toast({
            title: "Bem-vindo de volta!",
            description: "Login realizado com sucesso"
          });
          
          // Redirect after successful login
          setTimeout(async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;
            
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentUser.id)
              .maybeSingle();
            
            const role = data?.role;
            if (role === 'admin') {
              navigate('/painel/superadmin');
            } else if (role === 'lojista') {
              navigate('/painel/restaurante');
            } else {
              navigate('/restaurantes');
            }
          }, 500);
        }
      } else {
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.name, formData.phone);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "Erro no cadastro",
              description: "Este email já está cadastrado. Tente fazer login.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          setJustSignedUp(true);
          setIsHandlingAuth(false);
          toast({
            title: "Conta criada!",
            description: "Redirecionando para o painel..."
          });
          
          // Wait for user to be set and role to be created, then redirect
          setTimeout(async () => {
            // Get current user from auth
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
              console.error('No user found after signup');
              return;
            }
            
            // Wait a bit for the trigger to create the role and profile
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Try multiple times in case the trigger hasn't run yet
            let role = null;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (!role && attempts < maxAttempts) {
              const { data, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentUser.id)
                .maybeSingle();
              
              if (!roleError && data) {
                role = data.role;
                console.log('Role found after signup:', role);
                break;
              }
              
              attempts++;
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
            
            // Redirect based on role (default to lojista panel for new users)
            if (role === 'admin') {
              navigate('/painel/superadmin');
            } else if (role === 'lojista') {
              // New users should be lojistas - redirect to dashboard
              navigate('/painel/restaurante');
            } else {
              // If no role found, still redirect to lojista panel (should have role by now)
              console.warn('No role found, redirecting to lojista panel anyway');
              navigate('/painel/restaurante');
            }
            setJustSignedUp(false);
          }, 1000);
        }
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      setIsHandlingAuth(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/restaurantes')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar aos restaurantes
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center glow-primary">
                <span className="text-primary-foreground font-serif font-bold text-2xl">D</span>
              </div>
              <div>
                <h1 className="font-serif text-3xl font-semibold text-foreground">
                  {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {isLogin
                    ? 'Entre para acessar seus pedidos e pontos'
                    : 'Cadastre-se e ganhe pontos a cada pedido'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 bg-secondary border-border"
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Celular</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(51) 99999-9999"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 bg-secondary border-border"
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-secondary border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                {isSubmitting ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>

            {/* Toggle */}
            <div className="text-center">
              <p className="text-muted-foreground">
                {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setFormData({ name: '', phone: '', email: '', password: '' });
                  }}
                  className="ml-2 text-primary hover:text-primary/80 font-medium"
                >
                  {isLogin ? 'Cadastre-se' : 'Entre'}
                </button>
              </p>
            </div>

            {/* Features */}
            {!isLogin && (
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">Vantagens de ter uma conta:</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🍣', text: 'Pedidos salvos' },
                    { icon: '⭐', text: 'Programa de pontos' },
                    { icon: '🎁', text: 'Ofertas exclusivas' },
                    { icon: '⚡', text: 'Checkout rápido' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Image/Branding (Desktop only) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-background to-accent/10 items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-40 h-40 rounded-full border border-primary" />
            <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full border border-accent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-primary/50" />
          </div>

          <div className="relative z-10 text-center space-y-8 max-w-md">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Utensils className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-4xl font-semibold text-foreground mb-4">
                Delivery2U
              </h2>
              <p className="text-lg text-muted-foreground">
                A plataforma completa para delivery.
                Simples, rápida e eficiente.
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-serif text-primary">100+</div>
                <div>Restaurantes</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-serif text-primary">50k+</div>
                <div>Pedidos entregues</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-serif text-primary">99%</div>
                <div>Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
