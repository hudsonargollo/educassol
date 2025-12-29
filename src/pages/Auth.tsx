import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Brain, BarChart3, FileCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Verifique seu email." });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
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

  return (
    <div className="min-h-screen bg-[#0a0d14] relative overflow-hidden flex">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-center px-12 xl:px-20">
        <div className="absolute top-20 right-20 w-72 h-72 bg-examai-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 left-10 w-64 h-64 bg-violet-600/15 rounded-full blur-[80px]" />
        <div className="relative z-10 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-examai-purple-500/20 border border-examai-purple-500/30"><GraduationCap className="h-10 w-10 text-examai-purple-400" /></div>
            <h1 className="text-4xl font-bold text-white">Educa Sol</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-md">Transforme a educacao com ferramentas inteligentes de IA construidas para o futuro do aprendizado</p>
        </div>
        <div className="relative h-80 my-8">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative"><div className="absolute inset-0 bg-examai-purple-500/30 rounded-full blur-xl animate-pulse" /><div className="relative p-6 rounded-full bg-gradient-to-br from-examai-purple-500 to-violet-600 shadow-lg"><BookOpen className="h-10 w-10 text-white" /></div></div>
          </div>
          <div className="absolute left-[15%] top-[20%] animate-float"><div className="p-4 rounded-full bg-examai-purple-500/20 border border-examai-purple-500/30"><Brain className="h-6 w-6 text-examai-purple-400" /></div></div>
          <div className="absolute right-[20%] top-[15%] animate-float" style={{ animationDelay: '1s' }}><div className="p-4 rounded-full bg-violet-500/20 border border-violet-500/30"><Sparkles className="h-6 w-6 text-violet-400" /></div></div>
          <div className="absolute left-[25%] bottom-[15%] animate-float" style={{ animationDelay: '0.5s' }}><div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/30"><BarChart3 className="h-5 w-5 text-blue-400" /></div></div>
          <div className="absolute right-[15%] bottom-[25%] animate-float" style={{ animationDelay: '1.5s' }}><div className="p-4 rounded-full bg-amber-500/20 border border-amber-500/30"><FileCheck className="h-6 w-6 text-amber-400" /></div></div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6 mt-8">
          <FeatureItem icon={<Brain className="h-5 w-5" />} label="Correcao com IA" />
          <FeatureItem icon={<FileCheck className="h-5 w-5" />} label="Avaliacoes Inteligentes" />
          <FeatureItem icon={<BarChart3 className="h-5 w-5" />} label="Analise de Aprendizado" />
        </div>
      </div>
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8"><div className="flex items-center justify-center gap-3 mb-4"><div className="p-3 rounded-xl bg-examai-purple-500/20 border border-examai-purple-500/30"><GraduationCap className="h-8 w-8 text-examai-purple-400" /></div><h1 className="text-3xl font-bold text-white">Educa Sol</h1></div></div>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-examai-purple-500/20 via-violet-500/10 to-examai-purple-500/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-[#0f1219]/90 backdrop-blur-xl rounded-2xl border border-examai-purple-500/20 p-8 shadow-2xl">
              <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-2">{isLogin ? "Bem-vindo de volta" : "Criar conta"}</h2><p className="text-gray-400">{isLogin ? "Entre para liberar o poder da IA na educacao" : "Comece sua jornada com a IA educacional"}</p></div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1f2e] border border-gray-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-examai-purple-500 focus:ring-2 focus:ring-examai-purple-500/20 transition-all" required /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Senha</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className="w-full h-12 pl-12 pr-12 rounded-xl bg-[#1a1f2e] border border-gray-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-examai-purple-500 focus:ring-2 focus:ring-examai-purple-500/20 transition-all" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
                {isLogin && <div className="flex items-center justify-between"><label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} className="border-gray-600 data-[state=checked]:bg-examai-purple-500" /><span className="text-sm text-gray-400">Lembrar de mim</span></label><button type="button" className="text-sm text-examai-purple-400 hover:text-examai-purple-300">Esqueceu a senha?</button></div>}
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-400 hover:to-violet-400 shadow-lg shadow-examai-purple-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50">{loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{isLogin ? "Entrando..." : "Criando..."}</> : <>{isLogin ? "Entrar" : "Criar conta"}<ArrowRight className="h-5 w-5 ml-2" /></>}</Button>
                <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700/50" /></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-[#0f1219] text-gray-500">ou continue com</span></div></div>
                <button type="button" onClick={handleGoogleSignIn} className="w-full h-12 rounded-xl font-medium bg-[#1a1f2e] border border-gray-700/50 text-white hover:bg-[#252b3d] transition-all flex items-center justify-center gap-3"><svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Entrar com Google</button>
                <p className="text-center text-gray-400 mt-6">{isLogin ? "Nao tem uma conta?" : "Ja tem uma conta?"}{" "}<button type="button" onClick={() => setIsLogin(!isLogin)} className="text-examai-purple-400 hover:text-examai-purple-300 font-medium">{isLogin ? "Cadastre-se" : "Entre"}</button></p>
              </form>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">Ao continuar, voce concorda com nossos <a href="#" className="text-examai-purple-400 hover:underline">Termos</a> e <a href="#" className="text-examai-purple-400 hover:underline">Privacidade</a></p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (<div className="flex flex-col items-center gap-3 text-center"><div className="p-3 rounded-xl bg-examai-purple-500/10 border border-examai-purple-500/20 text-examai-purple-400">{icon}</div><span className="text-sm text-gray-400">{label}</span></div>);

export default Auth;
