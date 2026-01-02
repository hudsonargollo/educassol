import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { User, Bell, Shield, Palette, Save, Camera, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { tier, createCheckoutSession, isLoading: subscriptionLoading } = useSubscription();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    school: "",
    subject: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    contentUpdates: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setProfileData({
          name: session.user.user_metadata?.name || "",
          email: session.user.email || "",
          school: session.user.user_metadata?.school || "",
          subject: session.user.user_metadata?.subject || "",
        });
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          school: profileData.school,
          subject: profileData.subject,
        },
      });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      await createCheckoutSession();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isPremium = tier === 'premium' || tier === 'enterprise';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header user={user} onSignOut={handleSignOut} showNav={true} />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e informações de conta
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto p-1">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Assinatura
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Avatar Card */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Foto de Perfil</CardTitle>
                  <CardDescription>
                    Sua foto será exibida em seu perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-amber-500 text-white text-xl">
                        {getInitials(profileData.name || profileData.email)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-secondary border-2 border-card" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-primary/20 hover:border-primary/40"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar foto
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Form Card */}
              <Card className="md:col-span-2 border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Nome completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        placeholder="Seu nome"
                        className="bg-background border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school" className="text-foreground">Escola</Label>
                      <Input
                        id="school"
                        value={profileData.school}
                        onChange={(e) =>
                          setProfileData({ ...profileData, school: e.target.value })
                        }
                        placeholder="Nome da escola"
                        className="bg-background border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-foreground">Disciplina</Label>
                      <Input
                        id="subject"
                        value={profileData.subject}
                        onChange={(e) =>
                          setProfileData({ ...profileData, subject: e.target.value })
                        }
                        placeholder="Sua disciplina"
                        className="bg-background border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Current Plan */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    Plano Atual
                    <Badge variant={isPremium ? "default" : "secondary"}>
                      {isPremium ? "Premium" : "Grátis"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {isPremium 
                      ? "Você tem acesso a todos os recursos premium" 
                      : "Atualize para desbloquear recursos ilimitados"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isPremium ? (
                      <div className="space-y-3">
                        {["Gerações ilimitadas", "Uploads ilimitados", "Suporte prioritário", "Exportação avançada"].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Button
                        onClick={handleUpgrade}
                        disabled={subscriptionLoading}
                        className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white"
                      >
                        {subscriptionLoading ? "Carregando..." : "Assinar Premium - R$49,90/mês"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Summary */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Resumo de Uso</CardTitle>
                  <CardDescription>
                    Seu consumo no período atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/usage')}
                    >
                      Ver Detalhes de Uso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Atualizações de conteúdo</Label>
                    <p className="text-sm text-muted-foreground">
                      Seja notificado quando novos recursos estiverem disponíveis
                    </p>
                  </div>
                  <Switch
                    checked={notifications.contentUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, contentUpdates: checked })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Resumo semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo semanal das suas atividades
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyDigest: checked })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use o botão de tema no cabeçalho para alternar entre modo claro e escuro.
                  O tema será salvo automaticamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Segurança</CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Alterar senha</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enviaremos um link para redefinir sua senha
                  </p>
                  <Button
                    variant="outline"
                    className="border-primary/20 hover:border-primary/40"
                    onClick={async () => {
                      if (user?.email) {
                        await supabase.auth.resetPasswordForEmail(user.email);
                        toast({
                          title: "Email enviado",
                          description: "Verifique sua caixa de entrada para redefinir sua senha.",
                        });
                      }
                    }}
                  >
                    Enviar link de redefinição
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
