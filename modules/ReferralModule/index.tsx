"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ReferralCheckResult } from "./interface";
import { checkReferralCode } from "./payload";

const ReferralModule = () => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [checkResult, setCheckResult] = useState<ReferralCheckResult | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    setIsChecking(true);

    setTimeout(() => {
      const result = checkReferralCode(referralCode);
      setCheckResult(result);
      setIsChecking(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-5 border-b-2 border-blue-900">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
          KODE REFERRAL
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
          Klaim kode referral
        </h1>
        <p className="text-sm text-slate-700 mt-1">
          Masukkan kode referral dari teman atau sekolah untuk cek bonus coins.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cek kode referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="referralCode">KODE REFERRAL</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="CONTOH: JITU2026"
                  value={referralCode}
                  onChange={(e) =>
                    setReferralCode(e.target.value.toUpperCase())
                  }
                  onKeyDown={handleKeyDown}
                  className="pl-10 font-mono uppercase"
                />
              </div>
              <Button
                onClick={handleCheck}
                disabled={isChecking || !referralCode.trim()}
                variant="default"
                className="sm:w-auto w-full"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengecek...
                  </>
                ) : (
                  "Cek kode"
                )}
              </Button>
            </div>
          </div>

          {checkResult && (
            <div
              className={`p-5 border-2 ${
                checkResult.exists
                  ? "bg-emerald-50 border-[#15803D] text-blue-900"
                  : "bg-red-50 border-[#DC2626] text-blue-900"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {checkResult.exists ? (
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base mb-1">
                    {checkResult.message}
                  </h3>

                  {checkResult.exists && checkResult.ownerName && (
                    <p className="font-mono text-xs text-slate-700 mb-3">
                      KODE DARI: {checkResult.ownerName}
                    </p>
                  )}

                  {checkResult.exists && checkResult.benefits && (
                    <div className="mt-3 space-y-3">
                      <ul className="space-y-1.5 text-sm">
                        {checkResult.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#15803D] shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      <Button variant="primary" size="sm">
                        Pakai kode
                      </Button>
                    </div>
                  )}

                  {!checkResult.exists && (
                    <p className="text-xs text-slate-700 mt-1">
                      Periksa kembali ejaan kode referral yang kamu ketik.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralModule;
