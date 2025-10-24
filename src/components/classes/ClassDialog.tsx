import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClass?: any | null;
}

const GRADE_OPTIONS = [
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
];

const ANE_OPTIONS = [
  { value: "visual", label: "Deficiência Visual" },
  { value: "auditiva", label: "Deficiência Auditiva" },
  { value: "fisica", label: "Deficiência Física" },
  { value: "intelectual", label: "Deficiência Intelectual" },
  { value: "tea", label: "Transtorno do Espectro Autista (TEA)" },
  { value: "tdah", label: "TDAH" },
  { value: "dislexia", label: "Dislexia" },
  { value: "outras", label: "Outras Necessidades" },
];

const CITIES = [
  "Jequié",
  "Itagi",
  "Jitaúna",
  "Ipiaú",
  "Jaguaquara",
  "Aiquara",
];

const ClassDialog = ({ open, onOpenChange, editingClass }: ClassDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    total_alunos: "",
    possui_ane: false,
    detalhes_ane: "",
    city: "",
    school_id: "",
  });
  const [selectedAneTypes, setSelectedAneTypes] = useState<string[]>([]);
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadSchoolData = async () => {
      if (editingClass) {
        // Load school data for editing
        const { data: schoolData } = await supabase
          .from("schools")
          .select("id, name, city")
          .eq("id", editingClass.school_id)
          .single();

        if (schoolData) {
          setFormData({
            subject: editingClass.subject,
            grade: editingClass.grade,
            total_alunos: editingClass.total_alunos?.toString() || "",
            possui_ane: editingClass.possui_ane || false,
            detalhes_ane: editingClass.detalhes_ane || "",
            city: schoolData.city || "",
            school_id: schoolData.id,
          });
          
          // Load schools for the city
          const { data: schools } = await supabase
            .from("schools")
            .select("id, name")
            .eq("city", schoolData.city)
            .order("name");
          
          setAvailableSchools(schools || []);
        }

        // Parse existing ANE types from detalhes_ane if present
        if (editingClass.detalhes_ane) {
          const types = ANE_OPTIONS.map(opt => opt.label).filter(label => 
            editingClass.detalhes_ane?.includes(label)
          );
          setSelectedAneTypes(types.length > 0 ? types : []);
        }
      } else {
        // Load profile school if available
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("school_id")
            .eq("id", session.user.id)
            .single();

          if (profile?.school_id) {
            const { data: schoolData } = await supabase
              .from("schools")
              .select("id, name, city")
              .eq("id", profile.school_id)
              .single();

            if (schoolData) {
              setFormData({
                subject: "",
                grade: "",
                total_alunos: "",
                possui_ane: false,
                detalhes_ane: "",
                city: schoolData.city,
                school_id: schoolData.id,
              });

              // Load schools for the city
              const { data: schools } = await supabase
                .from("schools")
                .select("id, name")
                .eq("city", schoolData.city)
                .order("name");
              
              setAvailableSchools(schools || []);
            }
          } else {
            setFormData({
              subject: "",
              grade: "",
              total_alunos: "",
              possui_ane: false,
              detalhes_ane: "",
              city: "",
              school_id: "",
            });
          }
          setSelectedAneTypes([]);
        }
      }
    };

    if (open) {
      loadSchoolData();
    }
  }, [editingClass, open]);

  // Load schools when city changes
  useEffect(() => {
    const loadSchools = async () => {
      if (formData.city) {
        const { data: schools } = await supabase
          .from("schools")
          .select("id, name")
          .eq("city", formData.city)
          .order("name");
        
        setAvailableSchools(schools || []);
      } else {
        setAvailableSchools([]);
      }
    };

    loadSchools();
  }, [formData.city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      if (!formData.city) {
        throw new Error("Por favor, selecione a cidade.");
      }

      if (!formData.school_id) {
        throw new Error("Por favor, selecione a escola.");
      }

      // Get the school's district
      const { data: school } = await supabase
        .from("schools")
        .select("district_id")
        .eq("id", formData.school_id)
        .single();

      if (!school) throw new Error("Escola não encontrada.");

      // Update teacher's profile with school and district if not already set
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id, district_id")
        .eq("id", session.user.id)
        .single();

      if (profile?.school_id !== formData.school_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            school_id: formData.school_id,
            district_id: school.district_id,
          })
          .eq("id", session.user.id);

        if (profileError) throw profileError;
      }

      // Build ANE details from selected types and additional notes
      const aneDetails = formData.possui_ane 
        ? [
            selectedAneTypes.length > 0 ? `Tipos de necessidades: ${selectedAneTypes.join(", ")}` : "",
            formData.detalhes_ane.trim() ? `Detalhes adicionais: ${formData.detalhes_ane}` : ""
          ].filter(Boolean).join("\n")
        : null;

      const classData = {
        subject: formData.subject,
        grade: formData.grade,
        total_alunos: formData.total_alunos ? parseInt(formData.total_alunos) : null,
        possui_ane: formData.possui_ane,
        detalhes_ane: aneDetails,
        school_id: formData.school_id,
        teacher_id: session.user.id,
      };

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update(classData)
          .eq("id", editingClass.id);

        if (error) throw error;

        toast({
          title: "Turma atualizada",
          description: "As informações da turma foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("classes")
          .insert([classData]);

        if (error) throw error;

        toast({
          title: "Turma criada",
          description: "A turma foi criada com sucesso.",
        });
      }

      onOpenChange(true); // true = should refresh
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? "Editar Turma" : "Nova Turma"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações da turma para personalizar o conteúdo gerado pela IA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value, school_id: "" })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">Escola *</Label>
            <Select
              value={formData.school_id}
              onValueChange={(value) => setFormData({ ...formData, school_id: value })}
              required
              disabled={!formData.city}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.city ? "Selecione a escola" : "Primeiro selecione a cidade"} />
              </SelectTrigger>
              <SelectContent>
                {availableSchools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {availableSchools.length === 0 && formData.city 
                ? "Nenhuma escola encontrada nesta cidade" 
                : `${availableSchools.length} escola(s) disponível(is)`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Nome da Turma / Disciplina *</Label>
            <Input
              id="subject"
              placeholder="Ex: Matemática, Português, 5º A..."
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Ano Escolar *</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => setFormData({ ...formData, grade: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_alunos">Número Total de Alunos</Label>
            <Input
              id="total_alunos"
              type="number"
              min="1"
              placeholder="Ex: 30"
              value={formData.total_alunos}
              onChange={(e) => setFormData({ ...formData, total_alunos: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Este número será usado pela IA para contextualizar as atividades
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="possui_ane"
                checked={formData.possui_ane}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, possui_ane: checked as boolean })
                }
              />
              <Label htmlFor="possui_ane" className="cursor-pointer">
                Esta turma possui Alunos com Necessidades Especiais (ANE)
              </Label>
            </div>

            {formData.possui_ane && (
              <div className="space-y-4 pl-6">
                <div className="space-y-3">
                  <Label>Tipos de Necessidades Especiais</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ANE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={selectedAneTypes.includes(option.label)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAneTypes([...selectedAneTypes, option.label]);
                            } else {
                              setSelectedAneTypes(selectedAneTypes.filter(t => t !== option.label));
                            }
                          }}
                        />
                        <Label htmlFor={option.value} className="cursor-pointer text-sm font-normal">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detalhes_ane">Detalhes Adicionais (opcional)</Label>
                  <Textarea
                    id="detalhes_ane"
                    placeholder="Adicione informações específicas sobre as necessidades dos alunos..."
                    value={formData.detalhes_ane}
                    onChange={(e) => setFormData({ ...formData, detalhes_ane: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quanto mais detalhes você fornecer, mais personalizado será o conteúdo gerado
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingClass ? "Atualizar" : "Criar Turma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDialog;
