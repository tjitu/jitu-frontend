import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil } from "lucide-react";
import { Question } from "@/lib/api/AdminQuestionApi";

interface QuestionListProps {
  questions: Question[];
  onDelete: (id: string) => void;
  onEdit: (question: Question) => void;
  isLoading: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onDelete,
  onEdit,
  isLoading,
}) => {
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PILIHAN_GANDA":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none border-blue-200">
            Pilihan Ganda
          </Badge>
        );
      case "ISIAN_SINGKAT":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-none border-purple-200">
            Isian Singkat
          </Badge>
        );
      case "BENAR_SALAH":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-none border-orange-200">
            Benar/Salah
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[40%]">Konten Soal</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Poin</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Memuat daftar soal...
              </TableCell>
            </TableRow>
          ) : questions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Belum ada soal untuk subtest ini.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((q, index) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {truncate(stripHtml(q.content), 40)}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(q.type)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-bold">
                    {q.points} Poin
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onEdit(q)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Hapus soal ini?")) {
                          onDelete(q.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionList;
