import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Mail, Bell, Newspaper, Loader2 } from "lucide-react";

interface TokenData {
  userId: string;
  email: string;
  exp: number;
}

interface MarketingPreferences {
  lgpd_consent: boolean;
  newsletter: boolean;
  product_updates: boolean;
}

/**
 * Unsubscribe Page
 * 
 * Handles email unsubscribe and preferences management.
 * Works with token-based authentication (no login required).
 * 
 * Requirements: 2.3, 2.4, 2.5
 */
const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState<MarketingPreferences>({
    lgpd_consent: false,
    newsletter: false,
    product_updates: false,
  });

  const token = searchParams.get("token");
  const action = searchParams.get("action"); // 'preferences' or null (unsubscribe)

  // Decode and validate token
  useEffect(() => {
    const decodeToken = () => {
      if (!token) {
        setError("Token de descadastro não fornecido.");
        setLoading(false);
        return;
      }

      try {
        const decoded = atob(token);
        const parsed = JSON.parse(decoded) as TokenData;

        // Validate token structure
        if (!parsed.userId || !parsed.email || !parsed.exp) {
          throw new Error("Token inválido");
        }

        // Check expiration
        if (parsed.exp < Date.now()) {
          setError("Token expirado. Solicite um novo link de descadastro.");
          setLoading(false);
          return;
        }

        setTokenData(parsed);
        
        // If action is preferences, load current preferences
        if (action === "preferences") {
          loadPreferences(parsed.userId);
        } else {
          // Default action: unsubscribe immediately
          handleUnsubscribe(parsed.userId);
        }
      } catch (err) {
        console.error("Token decode error:", err);
        setError("Token inválido ou corrompido.");
        setLoading(false);
      }
    };

    decodeToken();
  }, [token, action]);

  const loadPreferences = async (userId: string) => {
    try {
      // Using type assertion since marketing_preferences may not be in generated types
      const { data, error: fetchError } = await (supabase
        .from("marketing_preferences" as any)
        .select("lgpd_consent, newsletter, product_updates")
        .eq("user_id", userId)
        .single() as any);

      if (fetchError) {
        console.error("Error loading preferences:", fetchError);
        setError("Não foi possível carregar suas preferências.");
        return;
      }

      if (data) {
        setPreferences({
          lgpd_consent: data.lgpd_consent ?? false,
          newsletter: data.newsletter ?? false,
          product_updates: data.product_updates ?? false,
        });
      }
    } catch (err) {
      console.error("Exception loading preferences:", err);
      setError("Erro ao carregar preferências.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (userId: string) => {
    try {
      // Using type assertion since marketing_preferences may not be in generated types
      const { error: updateError } = await (supabase
        .from("marketing_preferences" as any)
        .update({
          lgpd_consent: false,
          newsletter: false,
          product_updates: false,
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId) as any);

      if (updateError) {
        console.error("Error unsubscribing:", updateError);
        setError("Erro ao processar sua solicitação. Tente novamente.");
        return;
      }

      setSuccess(true);
      setPreferences({
        lgpd_consent: false,
        newsletter: false,
        product_updates: false,
      });
    } catch (err) {
      console.error("Exception unsubscribing:", err);
      setError("Erro interno. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!tokenData) return;

    setSaving(true);
    try {
      // Using type assertion since marketing_preferences may not be in generated types
      const { error: updateError } = await (supabase
        .from("marketing_preferences" as any)
        .update({
          lgpd_consent: preferences.lgpd_consent,
          newsletter: preferences.newsletter,
          product_updates: preferences.product_updates,
          updated_at: new Date().toISOString(),
          unsubscribed_at: (!preferences.lgpd_consent && !preferences.newsletter && !preferences.product_updates)
            ? new Date().toISOString()
            : null,
        })
        .eq("user_id", tokenData.userId) as any);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de email foram salvas com sucesso.",
      });
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setPreferences({
      lgpd_consent: false,
      newsletter: false,
      product_updates: false,
    });
    
    // Save immediately
    if (tokenData) {
      setSaving(true);
      try {
        // Using type assertion since marketing_preferences may not be in generated types
        await (supabase
          .from("marketing_preferences" as any)
          .update({
            lgpd_consent: false,
            newsletter: false,
            product_updates: false,
            unsubscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", tokenData.userId) as any);

        toast({
          title: "Descadastrado",
          description: "Você foi removido de todas as listas de email.",
        });
      } catch (err) {
        console.error("Error unsubscribing all:", err);
        toast({
          title: "Erro",
          description: "Não foi possível processar sua solicitação.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Erro ao processar</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Se o problema persistir, entre em contato conosco em{" "}
              <a href="mailto:suporte@educasol.com.br" className="text-primary hover:underline">
                suporte@educasol.com.br
              </a>
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar ao Educa Sol
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (after unsubscribe)
  if (success && action !== "preferences") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Descadastrado com sucesso</CardTitle>
            <CardDescription>
              O email {tokenData?.email} foi removido da nossa lista de marketing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Você não receberá mais emails de marketing do Educa Sol.
              Emails transacionais importantes (como redefinição de senha) continuarão sendo enviados.
            </p>
            <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
              Voltar ao Educa Sol
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preferences management view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Preferências de Email</CardTitle>
          <CardDescription>
            Escolha quais tipos de comunicação você deseja receber.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email display */}
          <div className="bg-muted rounded-lg px-4 py-3 text-sm">
            📧 {tokenData?.email}
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label className="font-medium">Consentimento LGPD</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Autorizo o Educa Sol a me enviar comunicações por email.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.lgpd_consent}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, lgpd_consent: checked })
                }
              />
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Newspaper className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label className="font-medium">Newsletter e Dicas</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receba dicas pedagógicas, novidades sobre a BNCC e conteúdo educacional.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.newsletter}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, newsletter: checked })
                }
              />
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label className="font-medium">Atualizações do Produto</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Alertas de uso, resumos semanais e novidades da plataforma.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.product_updates}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, product_updates: checked })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleUnsubscribeAll}
              disabled={saving}
            >
              Descadastrar de Tudo
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSavePreferences}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Preferências"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Emails transacionais importantes (como redefinição de senha) continuarão sendo enviados independente das suas preferências.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
