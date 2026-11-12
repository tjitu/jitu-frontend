"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  createTryout,
  createUtbkSubtests,
  getSubtestsByTryout,
  Subtest,
} from "@/lib/api/AdminTryoutApi";
import { TryoutFormData } from "./interface";
import { TryoutForm } from "./components/TryoutForm";
import { SubtestList } from "./components/SubtestList";

const CreateTryoutModule = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createdTryoutId, setCreatedTryoutId] = useState<string | null>(null);
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
    isSpecial: false,
    referralCode: "",
  });

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

  const fetchSubtests = async (id: string) => {
    try {
      const subtestsData = await getSubtestsByTryout(id);
      setSubtests(subtestsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch subtests:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createdTryoutId) return;

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

      const tryout = await createTryout(payload);

      if (tryout && tryout.id) {
        setCreatedTryoutId(tryout.id);
        await createUtbkSubtests(tryout.id);
        await fetchSubtests(tryout.id);
        toast.success("Tryout dan 7 subtes berhasil dibuat.");
      }
    } catch (error) {
      console.error("Failed to process tryout creation:", error);
      toast.error("Gagal membuat tryout. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push("/admin/tryout");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 pb-5 border-b border-border">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-label text-primary">
            MANAJEMEN UJIAN
          </p>
          <h1 className="text-h2 font-bold text-text">
            Buat tryout baru
          </h1>
        </div>
      </div>

      <TryoutForm
        formData={formData}
        handleChange={handleChange}
        handleSwitchChange={handleSwitchChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        createdTryoutId={createdTryoutId}
      />

      <SubtestList
        subtests={subtests}
        createdTryoutId={createdTryoutId}
        handleFinish={handleFinish}
        onRefresh={() => createdTryoutId && fetchSubtests(createdTryoutId)}
      />
    </div>
  );
};

export default CreateTryoutModule;