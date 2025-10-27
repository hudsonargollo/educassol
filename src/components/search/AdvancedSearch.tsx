import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";

interface SearchFilters {
  bnccCode?: string;
  keyword?: string;
  gradeLevel?: string;
  subject?: string;
  assetType?: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

const ASSET_TYPES = [
  { id: "jogo", label: "Jogo" },
  { id: "avaliacao", label: "Avaliação" },
  { id: "projeto", label: "Projeto" },
  { id: "atividade", label: "Atividade" },
  { id: "plano_aula", label: "Plano de Aula" },
];

const GRADE_LEVELS = [
  { value: "1", label: "1º Ano" },
  { value: "2", label: "2º Ano" },
  { value: "3", label: "3º Ano" },
  { value: "4", label: "4º Ano" },
  { value: "5", label: "5º Ano" },
];

const SUBJECTS = [
  { value: "lingua-portuguesa", label: "Língua Portuguesa" },
  { value: "matematica", label: "Matemática" },
  { value: "ciencias", label: "Ciências" },
  { value: "historia", label: "História" },
  { value: "geografia", label: "Geografia" },
  { value: "educacao-fisica", label: "Educação Física" },
  { value: "arte", label: "Arte" },
];

export const AdvancedSearch = ({ onSearch, isLoading = false }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch({
      ...filters,
      assetType: selectedAssetTypes,
    });
  };

  const handleAssetTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedAssetTypes([...selectedAssetTypes, type]);
    } else {
      setSelectedAssetTypes(selectedAssetTypes.filter((t) => t !== type));
    }
  };

  const handleReset = () => {
    setFilters({});
    setSelectedAssetTypes([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Busca Avançada
        </CardTitle>
        <CardDescription>
          Encontre conteúdo alinhado à BNCC com filtros específicos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BNCC Code Search */}
        <div className="space-y-2">
          <Label htmlFor="bncc-code">Código BNCC</Label>
          <Input
            id="bncc-code"
            placeholder="Ex: EF04LP03"
            value={filters.bnccCode || ""}
            onChange={(e) => setFilters({ ...filters, bnccCode: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Digite o código completo da habilidade BNCC (ex: EF04LP03)
          </p>
        </div>

        {/* Keyword Search */}
        <div className="space-y-2">
          <Label htmlFor="keyword">Palavra-chave</Label>
          <Input
            id="keyword"
            placeholder="Ex: frações, leitura, geometria"
            value={filters.keyword || ""}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          />
        </div>

        {/* Grade Level Filter */}
        <div className="space-y-2">
          <Label htmlFor="grade">Ano Escolar</Label>
          <Select value={filters.gradeLevel || ""} onValueChange={(value) => setFilters({ ...filters, gradeLevel: value })}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Selecione um ano" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Filter */}
        <div className="space-y-2">
          <Label htmlFor="subject">Disciplina</Label>
          <Select value={filters.subject || ""} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Selecione uma disciplina" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject.value} value={subject.value}>
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset Type Filter */}
        <div className="space-y-3">
          <Label>Tipo de Conteúdo</Label>
          <div className="space-y-2">
            {ASSET_TYPES.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={selectedAssetTypes.includes(type.id)}
                  onCheckedChange={(checked) => handleAssetTypeChange(type.id, checked as boolean)}
                />
                <Label htmlFor={type.id} className="font-normal cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;

