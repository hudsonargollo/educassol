import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrintableContentProps {
  title: string;
  content: string;
  bnccCode?: string;
  gradeLevel?: string;
  subject?: string;
  onPrint?: () => void;
}

export const PrintableContent = ({
  title,
  content,
  bnccCode,
  gradeLevel,
  subject,
  onPrint,
}: PrintableContentProps) => {
  const { toast } = useToast();

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                border-bottom: 2px solid #333;
                margin-bottom: 20px;
                padding-bottom: 10px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .metadata {
                font-size: 12px;
                color: #666;
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
              }
              .metadata-item {
                display: flex;
                gap: 5px;
              }
              .content {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-size: 14px;
              }
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${title}</div>
              <div class="metadata">
                ${bnccCode ? `<div class="metadata-item"><strong>BNCC:</strong> ${bnccCode}</div>` : ""}
                ${gradeLevel ? `<div class="metadata-item"><strong>Ano:</strong> ${gradeLevel}</div>` : ""}
                ${subject ? `<div class="metadata-item"><strong>Disciplina:</strong> ${subject}</div>` : ""}
              </div>
            </div>
            <div class="content">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    onPrint?.();
    toast({
      title: "Sucesso",
      description: "Documento enviado para impressão",
    });
  };

  const handleDownloadPDF = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Sucesso",
      description: "Arquivo baixado com sucesso",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualizar para Impressão</DialogTitle>
          <DialogDescription>
            Visualize e imprima o conteúdo em formato amigável
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Print Preview */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="border-b-2 border-gray-300 pb-4 mb-4">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                {bnccCode && <p><strong>BNCC:</strong> {bnccCode}</p>}
                {gradeLevel && <p><strong>Ano Escolar:</strong> {gradeLevel}</p>}
                {subject && <p><strong>Disciplina:</strong> {subject}</p>}
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Baixar como TXT
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintableContent;

