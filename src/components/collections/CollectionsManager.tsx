import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BookmarkPlus, Trash2, Edit2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdAt: string;
}

interface CollectionsManagerProps {
  collections?: Collection[];
  onCreateCollection?: (name: string, description: string) => void;
  onDeleteCollection?: (id: string) => void;
  onEditCollection?: (id: string, name: string, description: string) => void;
}

export const CollectionsManager = ({
  collections = [],
  onCreateCollection,
  onDeleteCollection,
  onEditCollection,
}: CollectionsManagerProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da coleção é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      onEditCollection?.(editingId, formData.name, formData.description);
      toast({
        title: "Sucesso",
        description: "Coleção atualizada com sucesso",
      });
    } else {
      onCreateCollection?.(formData.name, formData.description);
      toast({
        title: "Sucesso",
        description: "Coleção criada com sucesso",
      });
    }

    setFormData({ name: "", description: "" });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (collection: Collection) => {
    setFormData({ name: collection.name, description: collection.description });
    setEditingId(collection.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta coleção?")) {
      onDeleteCollection?.(id);
      toast({
        title: "Sucesso",
        description: "Coleção deletada com sucesso",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minhas Coleções</h2>
          <p className="text-muted-foreground">
            Organize e salve seus conteúdos favoritos
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormData({ name: "", description: "" }); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Coleção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Coleção" : "Criar Nova Coleção"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Atualize os detalhes da sua coleção"
                  : "Crie uma nova coleção para organizar seus conteúdos"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Coleção</Label>
                <Input
                  id="name"
                  placeholder="Ex: Aulas de Matemática"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o propósito desta coleção..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookmarkPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Você ainda não tem coleções. Crie uma para começar a organizar seus conteúdos!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{collection.name}</CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {collection.itemCount} item{collection.itemCount !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(collection)}
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(collection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsManager;

