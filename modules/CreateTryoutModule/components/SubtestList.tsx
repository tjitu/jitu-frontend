import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock, FileText, Pencil } from "lucide-react";
import { Subtest } from "@/lib/api/AdminTryoutApi";
import Link from "next/link";
import { EditSubtestDialog } from "./EditSubtestDialog";

interface SubtestListProps {
  subtests: Subtest[];
  createdTryoutId: string | null;
  handleFinish: () => void;
  onRefresh?: () => void;
}

export const SubtestList: React.FC<SubtestListProps> = ({
  subtests,
  createdTryoutId,
  handleFinish,
  onRefresh,
}) => {
  const [selectedSubtest, setSelectedSubtest] =
    React.useState<Subtest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  return (
    <Card className={createdTryoutId ? "opacity-100" : "opacity-60"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Daftar 7 subtes SNBT
          {!createdTryoutId && <Lock className="w-4 h-4 text-slate-500" />}
        </CardTitle>
        <CardDescription>
          {createdTryoutId
            ? "7 subtes standar SNBT telah dibuat otomatis."
            : "Subtes akan dibuat otomatis setelah detail tryout disimpan."}
        </CardDescription>
      </CardHeader>
      {createdTryoutId && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Urutan</TableHead>
                <TableHead>Nama Subtes</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subtests.map((subtest) => (
                <TableRow key={subtest.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    0{subtest.order}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-900">
                    {subtest.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {subtest.durationMinutes} menit
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedSubtest(subtest);
                          setIsEditDialogOpen(true);
                        }}
                        title="Ubah durasi"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/tryout/${createdTryoutId}/s/${subtest.id}`}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          Kelola soal
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-6">
            <Button onClick={handleFinish} variant="primary">
              Selesai &amp; kembali
            </Button>
          </div>
        </CardContent>
      )}

      <EditSubtestDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        subtest={selectedSubtest}
        onSuccess={() => onRefresh?.()}
      />
    </Card>
  );
};
