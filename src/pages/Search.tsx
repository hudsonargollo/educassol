import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdvancedSearch from "@/components/search/AdvancedSearch";
import PrintableContent from "@/components/print/PrintableContent";
import Header from "@/components/Header";

interface SearchFilters {
  bnccCode?: string;
  keyword?: string;
  gradeLevel?: string;
  subject?: string;
  assetType?: string[];
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  bnccCode: string;
  gradeLevel: string;
  subject: string;
  type: string;
  content: string;
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
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

  const handleSearch = async (filters: SearchFilters) => {
    setSearching(true);
    try {
      // Mock search results - in production, this would call a real API
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Frações - Introdução",
          description: "Atividade introdutória sobre frações para 4º ano",
          bnccCode: filters.bnccCode || "EF04MA09",
          gradeLevel: filters.gradeLevel || "4",
          subject: filters.subject || "matematica",
          type: "atividade",
          content: `Atividade: Introdução a Frações

Objetivo: Compreender o conceito básico de frações.

Instruções:
1. Divida a turma em grupos de 3-4 alunos
2. Distribua papel e peça para dividirem em partes iguais
3. Discuta o conceito de frações com exemplos práticos
4. Realize exercícios de identificação de frações

Recursos necessários:
- Papel colorido
- Tesoura
- Marcadores`,
        },
        {
          id: "2",
          title: "Plano de Aula - Leitura Compartilhada",
          description: "Plano completo para aula de leitura compartilhada",
          bnccCode: filters.bnccCode || "EF02LP01",
          gradeLevel: filters.gradeLevel || "2",
          subject: filters.subject || "lingua-portuguesa",
          type: "plano_aula",
          content: `Plano de Aula: Leitura Compartilhada

Duração: 45 minutos
Ano: 2º Ano
Disciplina: Língua Portuguesa

Objetivos:
- Desenvolver fluência leitora
- Compreender textos simples
- Participar de discussões sobre leitura

Metodologia:
1. Introdução (5 min)
2. Leitura compartilhada (20 min)
3. Discussão (15 min)
4. Atividade de consolidação (5 min)

Avaliação:
- Observação da participação
- Compreensão do texto`,
        },
      ];

      // Filter results based on search criteria
      const filtered = mockResults.filter((result) => {
        if (filters.bnccCode && !result.bnccCode.includes(filters.bnccCode)) return false;
        if (filters.keyword && !result.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
        if (filters.gradeLevel && result.gradeLevel !== filters.gradeLevel) return false;
        if (filters.subject && result.subject !== filters.subject) return false;
        if (filters.assetType && filters.assetType.length > 0 && !filters.assetType.includes(result.type)) return false;
        return true;
      });

      setResults(filtered);
      toast({
        title: "Busca Concluída",
        description: `${filtered.length} resultado(s) encontrado(s)`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao realizar busca. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme support */}
      <Header 
        user={user} 
        onSignOut={handleSignOut} 
        showNav={true} 
      />

      {/* Main Content - Add padding-top to account for fixed header */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Buscar Conteúdo</h2>
          <p className="text-muted-foreground">
            Encontre conteúdo educacional alinhado à BNCC
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <AdvancedSearch onSearch={handleSearch} isLoading={searching} />
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            {results.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searching ? "Buscando..." : "Use os filtros ao lado para buscar conteúdo"}
                  </p>
                </CardContent>
              </Card>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {results.length} resultado(s) encontrado(s)
                </p>
                {results.map((result) => (
                  <Card key={result.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      <CardDescription>{result.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">BNCC</p>
                            <p className="font-semibold">{result.bnccCode}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ano</p>
                            <p className="font-semibold">{result.gradeLevel}º</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Disciplina</p>
                            <p className="font-semibold capitalize">{result.subject}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tipo</p>
                            <p className="font-semibold capitalize">{result.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedResult(result)}
                          >
                            Ver Detalhes
                          </Button>
                          <PrintableContent
                            title={result.title}
                            content={result.content}
                            bnccCode={result.bnccCode}
                            gradeLevel={result.gradeLevel}
                            subject={result.subject}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedResult.title}</CardTitle>
              <CardDescription>{selectedResult.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">BNCC</p>
                  <p className="font-semibold">{selectedResult.bnccCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ano</p>
                  <p className="font-semibold">{selectedResult.gradeLevel}º</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disciplina</p>
                  <p className="font-semibold capitalize">{selectedResult.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-semibold capitalize">{selectedResult.type}</p>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed border rounded p-4 bg-muted">
                {selectedResult.content}
              </div>
              <div className="flex gap-2">
                <PrintableContent
                  title={selectedResult.title}
                  content={selectedResult.content}
                  bnccCode={selectedResult.bnccCode}
                  gradeLevel={selectedResult.gradeLevel}
                  subject={selectedResult.subject}
                />
                <Button onClick={() => setSelectedResult(null)}>Fechar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Search;

