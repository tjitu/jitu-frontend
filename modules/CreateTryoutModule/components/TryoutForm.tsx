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
import { Loader2, Save, CheckCircle2, Globe, Lock, Sparkles } from "lucide-react";
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
              <Label htmlFor="title">Nama tryout</Label>
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
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deskripsi singkat tryout..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-md border border-border bg-surface-muted space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-semibold text-text flex items-center gap-1.5">
                      {formData.isPublic ? (
                        <Globe className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-yellow-700" />
                      )}
                      Akses tryout
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
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
                    <Label htmlFor="referralCode">Kode akses</Label>
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
                <Label htmlFor="solutionPrice">Coin pembahasan</Label>
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
                <p className="text-[12px] text-text-muted mt-1">
                  Isi 0 untuk tryout gratis.
                </p>
              </div>
            </div>

            <label
              htmlFor="isSpecial"
              className={`flex items-start justify-between gap-3 p-4 rounded-md border cursor-pointer transition-colors ${
                formData.isSpecial
                  ? "border-purple-300 bg-purple-50/75"
                  : "border-border bg-surface-muted hover:border-ink-300"
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-[13px] font-semibold text-text flex items-center gap-1.5">
                  <Sparkles
                    className={`h-3.5 w-3.5 ${
                      formData.isSpecial ? "text-purple-600" : "text-text-muted"
                    }`}
                  />
                  <span>Special tryout</span>
                </div>
                <p className="text-xs text-text-muted">
                  Tampilkan overlay ungu eksklusif dan gambar banner khusus pada kartu tryout ini.
                </p>
              </div>
              <input
                id="isSpecial"
                name="isSpecial"
                type="checkbox"
                checked={formData.isSpecial}
                onChange={(e) =>
                  handleSwitchChange("isSpecial", e.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-purple-600 cursor-pointer shrink-0"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="batch">Kategori batch</Label>
                <select
                  id="batch"
                  name="batch"
                  className="flex h-11 w-full rounded-md border border-border bg-surface px-3.5 py-2 text-sm text-text hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 transition-colors"
                  value={formData.batch}
                  onChange={handleChange}
                >
                  <option value="SNBT">SNBT</option>
                  <option value="MANDIRI">MANDIRI</option>
                </select>
              </div>

              <div>
                <Label htmlFor="releaseDate">Tanggal rilis</Label>
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
                <Label htmlFor="scheduledStart">Jadwal mulai</Label>
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
                <Label htmlFor="scheduledEnd">Jadwal selesai</Label>
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
