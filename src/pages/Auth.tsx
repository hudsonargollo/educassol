import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Brain, 
  BarChart3, 
  FileCheck, 
  BookOpen, 
  Lightbulb, 
  Target,
  CheckCircle2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { name }
          }
        });
        if (error) throw error;
        toast({ 
          title: "Conta criada com sucesso!", 
          description: "Verifique seu email para confirmar o cadastro." 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
  };

  const features = [
    { icon: Brain, label: "Correção com IA", description: "Avaliações automáticas" },
    { icon: FileCheck, label: "Planos de Aula", description: "Alinhados à BNCC" },
    { icon: BarChart3, label: "Análise de Dados", description: "Acompanhe o progresso" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0d14] via-[#0f1219] to-[#0a0d14] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.1, 0.2, 0.1],
            x: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] bg-gradient-to-br from-purple-600/30 to-violet-500/20"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2], 
            opacity: [0.08, 0.15, 0.08],
            x: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-br from-teal-500/20 to-emerald-400/10"
        />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-5xl"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-purple-500/10 rounded-3xl blur-xl" />
        
        <div className="relative bg-[#0f1219]/90 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          
          {/* Left side - Branding */}
          <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Educa Sol</h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-base mb-8 max-w-sm leading-relaxed"
            >
              Transforme a educação com ferramentas inteligentes de IA construídas para o futuro do aprendizado.
            </motion.p>

            {/* Animated illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative flex-1 min-h-[280px] flex items-center justify-center"
            >
              <AuthIllustration />
            </motion.div>

            {/* Feature items with shine effect */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 mt-6"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex flex-col items-center gap-2 text-center group relative"
                >
                  {/* Shine/glow effect container */}
                  <div className="relative">
                    {/* Animated glow behind icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-xl bg-purple-500/30 blur-xl"
                    />
                    {/* Icon container with shine sweep */}
                    <motion.div 
                      className="relative p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all overflow-hidden"
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(168, 85, 247, 0)',
                          '0 0 20px rgba(168, 85, 247, 0.4)',
                          '0 0 0px rgba(168, 85, 247, 0)',
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      {/* Shine sweep effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          delay: i * 0.8,
                          ease: "easeInOut",
                        }}
                      />
                      <feature.icon className="h-5 w-5 relative z-10" />
                    </motion.div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right side - Form */}
          <div className="lg:w-1/2 p-8 lg:p-10 bg-[#12161f]/60 border-t lg:border-t-0 lg:border-l border-gray-800/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
                  </h2>
                  <p className="text-gray-400">
                    {isLogin 
                      ? "Entre para acessar suas ferramentas de IA" 
                      : "Comece sua jornada com a IA educacional"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field (signup only) */}
                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-gray-300">Nome completo</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Seu nome"
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#1a1f2e] border border-gray-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                            required={!isLogin}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="seu@email.com"
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#1a1f2e] border border-gray-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                        required 
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Sua senha"
                        className="w-full h-12 pl-11 pr-12 rounded-xl bg-[#1a1f2e] border border-gray-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me / Forgot password */}
                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <Checkbox 
                          checked={rememberMe} 
                          onCheckedChange={(c) => setRememberMe(c as boolean)} 
                          className="h-4 w-4 border-gray-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" 
                        />
                        <span className="text-sm text-gray-400">Lembrar de mim</span>
                      </label>
                      <button type="button" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        Esqueceu a senha?
                      </button>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isLogin ? "Entrando..." : "Criando conta..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{isLogin ? "Entrar" : "Criar conta"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700/50" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-[#12161f] text-sm text-gray-500">ou continue com</span>
                    </div>
                  </div>

                  {/* Google button */}
                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn} 
                    className="w-full h-12 rounded-xl font-medium bg-[#1a1f2e] border border-gray-700/50 text-white hover:bg-[#252b3d] hover:border-gray-600/50 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Entrar com Google</span>
                  </button>

                  {/* Toggle login/signup */}
                  <p className="text-center text-gray-400 mt-6">
                    {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                    <button 
                      type="button" 
                      onClick={() => setIsLogin(!isLogin)} 
                      className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                    >
                      {isLogin ? "Cadastre-se" : "Entre"}
                    </button>
                  </p>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-600 mt-6"
        >
          Ao continuar, você concorda com nossos{" "}
          <a href="/terms" className="text-purple-400/70 hover:text-purple-400 hover:underline transition-colors">Termos</a>
          {" "}e{" "}
          <a href="/privacy" className="text-purple-400/70 hover:text-purple-400 hover:underline transition-colors">Privacidade</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

/**
 * Enhanced animated illustration for the auth page
 * With 5 orbiting icons and advanced animations
 */
function AuthIllustration() {
  const orbitingIcons = [
    { icon: Brain, color: 'from-purple-500 to-violet-500', angle: 0 },
    { icon: Target, color: 'from-teal-500 to-emerald-500', angle: 72 },
    { icon: Lightbulb, color: 'from-amber-500 to-orange-500', angle: 144 },
    { icon: FileCheck, color: 'from-blue-500 to-cyan-500', angle: 216 },
    { icon: Sparkles, color: 'from-pink-500 to-rose-500', angle: 288 },
  ];

  return (
    <div className="relative w-full max-w-[280px] aspect-square">
      {/* Glow background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-500/20 blur-3xl"
      />

      {/* Outer orbit ring - rotating */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/25" />
        
        {/* Orbiting icons on outer ring */}
        {orbitingIcons.map((item, i) => {
          const angleRad = (item.angle * Math.PI) / 180;
          const radius = 50; // percentage from center
          const x = 50 + radius * Math.cos(angleRad);
          const y = 50 + radius * Math.sin(angleRad);
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ 
                rotate: -360, // counter-rotate to stay upright
                scale: [1, 1.15, 1],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, delay: i * 0.3 },
              }}
            >
              <motion.div 
                className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(168, 85, 247, 0.3)',
                    '0 0 25px rgba(168, 85, 247, 0.5)',
                    '0 0 10px rgba(168, 85, 247, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                <item.icon className="h-4 w-4 text-white" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Middle ring - counter-rotating */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-8 rounded-full border border-dashed border-violet-500/20"
      />
      
      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-16 rounded-full border border-dashed border-purple-500/15"
      />

      {/* Center icon with pulsing glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative"
        >
          {/* Glow layers */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-purple-500/40 to-violet-500/30 blur-xl"
          />
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-xl shadow-purple-500/40">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Floating particles with trails */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const radius = 60 + (i % 3) * 15;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI) * radius],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-400 blur-[1px]" />
          </motion.div>
        );
      })}
    </div>
  );
}

export default Auth;
