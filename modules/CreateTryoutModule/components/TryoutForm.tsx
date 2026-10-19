import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle2, Globe, Lock } from "lucide-react";
import { TryoutFormData } from "../interface";

interface TryoutFormProps {
  formData: TryoutFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  createdTryoutId: string | null;
  isEdit?: boolean;
}

export const TryoutForm: React.FC<TryoutFormProps> = ({
  formData,
  handleChange,
  handleSwitchChange,
  handleSubmit,
  isLoading,
  createdTryoutId,
  isEdit = false,
}) => {
  return (
    <Card
      className={!isEdit && createdTryoutId ? "opacity-80" : "opacity-100"}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle>
              {isEdit ? "Informasi tryout" : "Detail tryout baru"}
            </CardTitle>
            <CardDescription>
              Atur nama, jadwal pelaksanaan, dan kebutuhan coin pembahasan.
            </CardDescription>
          </div>
          {!isEdit && createdTryoutId && (
            <Badge variant="success">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              TERSIMPAN
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset
            disabled={!isEdit && !!createdTryoutId}
            className="space-y-5 group-disabled:opacity-50"
          >
            <div>
              <Label htmlFor="title">NAMA TRYOUT</Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Tryout #15 · Simulasi SNBT 2026"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="description">DESKRIPSI</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deskripsi singkat tryout..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 border border-slate-200/90 bg-slate-50/70 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.08em] font-medium text-slate-900 flex items-center gap-1.5">
                      {formData.isPublic ? (
                        <Globe className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-warn" />
                      )}
                      AKSES TRYOUT
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formData.isPublic
                        ? "Publik: terbuka untuk semua peserta"
                        : "Privat: wajib kode akses"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isPublic", checked)
                    }
                  />
                </div>

                {!formData.isPublic && (
                  <div className="pt-2">
                    <Label htmlFor="referralCode">KODE AKSES</Label>
                    <Input
                      id="referralCode"
                      name="referralCode"
                      placeholder="CONTOH: AKSES-JITU"
                      value={formData.referralCode}
                      onChange={handleChange}
                      className="font-mono uppercase"
                      required={!formData.isPublic}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="solutionPrice">COIN PEMBAHASAN</Label>
                <Input
                  id="solutionPrice"
                  name="solutionPrice"
                  type="number"
                  min="0"
                  required
                  value={formData.solutionPrice}
                  onChange={handleChange}
                  className="font-mono"
                />
                <p className="font-mono text-[11px] text-slate-600 mt-1">
                  Isi 0 untuk tryout gratis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="batch">KATEGORI BATCH</Label>
                <select
                  id="batch"
                  name="batch"
                  className="flex h-11 w-full border-[1.5px] border-slate-300 bg-white px-3.5 py-2 text-sm text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={formData.batch}
                  onChange={handleChange}
                >
                  <option value="SNBT">SNBT</option>
                  <option value="MANDIRI">MANDIRI</option>
                </select>
              </div>

              <div>
                <Label htmlFor="releaseDate">TANGGAL RILIS</Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="datetime-local"
                  required
                  value={formData.releaseDate}
                  onChange={handleChange}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="scheduledStart">JADWAL MULAI</Label>
                <Input
                  id="scheduledStart"
                  name="scheduledStart"
                  type="datetime-local"
                  required
                  value={formData.scheduledStart}
                  onChange={handleChange}
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="scheduledEnd">JADWAL SELESAI</Label>
                <Input
                  id="scheduledEnd"
                  name="scheduledEnd"
                  type="datetime-local"
                  required
                  value={formData.scheduledEnd}
                  onChange={handleChange}
                  className="font-mono"
                />
              </div>
            </div>
          </fieldset>

          {(!createdTryoutId || isEdit) && (
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Simpan perubahan" : "Simpan & buat subtes"}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
