"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Eye } from "lucide-react";
import {
  getTryoutById,
  getSubtestsByTryout,
  updateTryout,
  Subtest,
} from "@/lib/api/AdminTryoutApi";
import { TryoutFormData } from "@/modules/CreateTryoutModule/interface";
import { TryoutForm } from "@/modules/CreateTryoutModule/components/TryoutForm";
import { SubtestList } from "@/modules/CreateTryoutModule/components/SubtestList";
import { toast } from "sonner";
import Link from "next/link";

const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

interface EditTryoutModuleProps {
  tryoutId: string;
}

const EditTryoutModule: React.FC<EditTryoutModuleProps> = ({ tryoutId }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [subtests, setSubtests] = useState<Subtest[]>([]);
  const [formData, setFormData] = useState<TryoutFormData>({
    title: "",
    description: "",
    solutionPrice: 0,
    batch: "SNBT",
    releaseDate: "",
    scheduledStart: "",
    scheduledEnd: "",
    isPublic: true,
    referralCode: "",
  });

  const fetchSubtests = useCallback(async () => {
    try {
      const subtestsData = await getSubtestsByTryout(tryoutId);
      setSubtests(
        subtestsData.sort((a: Subtest, b: Subtest) => a.order - b.order),
      );
    } catch (error) {
      console.error("Failed to fetch subtests:", error);
    }
  }, [tryoutId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const [tryout] = await Promise.all([
          getTryoutById(tryoutId),
          fetchSubtests(),
        ]);

        setFormData({
          title: tryout.title,
          description: tryout.description || "",
          solutionPrice: tryout.solutionPrice,
          batch: tryout.batch,
          releaseDate: formatDateForInput(tryout.releaseDate),
          scheduledStart: formatDateForInput(tryout.scheduledStart),
          scheduledEnd: formatDateForInput(tryout.scheduledEnd),
          isPublic: tryout.isPublic ?? true,
          referralCode: tryout.referralCode || "",
        });
      } catch (error) {
        console.error("Failed to fetch tryout data:", error);
        toast.error("Data gagal dimuat. Muat ulang halaman.");
      } finally {
        setIsFetching(false);
      }
    };

    if (tryoutId) {
      fetchData();
    }
  }, [tryoutId, fetchSubtests]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "solutionPrice"
          ? value === ""
            ? ""
            : parseInt(value)
          : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        solutionPrice:
          formData.solutionPrice === "" ? 0 : Number(formData.solutionPrice),
        releaseDate: new Date(formData.releaseDate).toISOString(),
        scheduledStart: new Date(formData.scheduledStart).toISOString(),
        scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
      };

      await updateTryout(tryoutId, payload);
      toast.success("Perubahan tryout disimpan.");
    } catch (error) {
      console.error("Failed to update tryout:", error);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push("/admin/tryout");
  };

  if (isFetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT TRYOUT...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-blue-900">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/tryout">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
              MANAJEMEN UJIAN
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
              Kelola tryout
            </h1>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/tryout/${tryoutId}/preview`}>
            <Eye className="h-4 w-4 mr-2" />
            Pratinjau
          </Link>
        </Button>
      </div>

      <TryoutForm
        formData={formData}
        handleChange={handleChange}
        handleSwitchChange={handleSwitchChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        createdTryoutId={tryoutId}
        isEdit={true}
      />

      <SubtestList
        subtests={subtests}
        createdTryoutId={tryoutId}
        handleFinish={handleFinish}
        onRefresh={fetchSubtests}
      />
    </div>
  );
};

export default EditTryoutModule;
