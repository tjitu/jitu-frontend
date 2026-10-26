"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Lock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { HIRING_DIVISIONS, HIRING_POSITIONS } from "@/lib/hiring-types";

const BROWSER_SUBMISSION_KEY = "jitu_hiring_applied_2026";
const BROWSER_SUBMISSION_COOKIE = "jitu_hiring_applied_2026";

interface SubmittedRecord {
  id: string;
  fullName: string;
  email: string;
  primaryRole: string;
  submittedAt: string;
}

interface FormState {
  fullName: string;
  email: string;
  whatsapp: string;
  university: string;
  major: string;
  academicStatus: string;
  domicile: string;
  primaryRole: string;
  secondaryRole: string;
  availability: string;
  startDate: string;
  cvUrl: string;
  cvFileName: string;
  portfolioUrl: string;
  linkedinUrl: string;
  experienceEssay: string;
  motivationEssay: string;
  referralSource: string;
  commitmentAgreed: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  whatsapp: "",
  university: "",
  major: "",
  academicStatus: "Active Undergraduate (S1/D4)",
  domicile: "",
  primaryRole: "",
  secondaryRole: "",
  availability: "15–20 hours/week",
  startDate: "Immediately",
  cvUrl: "",
  cvFileName: "",
  portfolioUrl: "",
  linkedinUrl: "",
  experienceEssay: "",
  motivationEssay: "",
  referralSource: "Instagram",
  commitmentAgreed: false,
};

export default function HiringModule() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [browserRecord, setBrowserRecord] = useState<SubmittedRecord | null>(
    null
  );
  const [copiedId, setCopiedId] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const local = localStorage.getItem(BROWSER_SUBMISSION_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed?.id) {
          setBrowserRecord(parsed);
          return;
        }
      }
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${BROWSER_SUBMISSION_COOKIE}=([^;]*)`)
      );
      if (match && match[1]) {
        try {
          const parsedCookie = JSON.parse(decodeURIComponent(match[1]));
          if (parsedCookie?.id) {
            setBrowserRecord(parsedCookie);
            return;
          }
        } catch {
          setBrowserRecord({
            id: decodeURIComponent(match[1]),
            fullName: "Candidate",
            email: "",
            primaryRole: "Open Hiring 2026",
            submittedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Storage check error:", err);
    }
  }, []);

  const markBrowserAsSubmitted = (record: SubmittedRecord) => {
    try {
      localStorage.setItem(BROWSER_SUBMISSION_KEY, JSON.stringify(record));
      const val = encodeURIComponent(JSON.stringify(record));
      document.cookie = `${BROWSER_SUBMISSION_COOKIE}=${val}; max-age=34560000; path=/; SameSite=Lax`;
    } catch (err) {
      console.error("Failed to mark browser:", err);
    }
  };

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (browserRecord) {
      toast.info("You have already submitted an application on this device.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (browserRecord) {
      toast.error(
        "You have already submitted an application from this browser."
      );
      return;
    }

    setFieldErrors({});

    // Client-side pre-validation
    const clientErrors: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      clientErrors.fullName = "Please enter your full name.";
    }
    if (
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      clientErrors.email = "Please enter a valid email address.";
    }
    if (!form.whatsapp.trim() || form.whatsapp.replace(/\D/g, "").length < 8) {
      clientErrors.whatsapp =
        "Please enter an active WhatsApp number (min. 8 digits).";
    }
    if (!form.domicile.trim()) {
      clientErrors.domicile = "Please enter your current city/domicile.";
    }
    if (!form.university.trim()) {
      clientErrors.university =
        "Please enter your university, school, or institution.";
    }
    if (!form.major.trim()) {
      clientErrors.major = "Please enter your major / department.";
    }
    if (!form.primaryRole) {
      clientErrors.primaryRole = "Please select your primary position.";
    }
    if (!form.cvUrl.trim()) {
      clientErrors.cvUrl =
        "Please provide your CV / Resume link (Google Drive, Notion, etc.).";
    }
    if (
      !form.experienceEssay.trim() ||
      form.experienceEssay.trim().length < 15
    ) {
      clientErrors.experienceEssay =
        "Please briefly share your relevant experience (min. 15 characters).";
    }
    if (
      !form.motivationEssay.trim() ||
      form.motivationEssay.trim().length < 15
    ) {
      clientErrors.motivationEssay =
        "Please briefly explain why you want to join JITU (min. 15 characters).";
    }
    if (!form.commitmentAgreed) {
      clientErrors.commitmentAgreed =
        "Please confirm that you understand the profit-sharing terms.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const firstKey = Object.keys(clientErrors)[0];
      const firstMsg = clientErrors[firstKey];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      }
      toast.error(firstMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hiring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.alreadySubmitted && data?.application) {
          const record: SubmittedRecord = {
            id: data.application.id,
            fullName: data.application.fullName || form.fullName,
            email: data.application.email || form.email,
            primaryRole: data.application.primaryRole || form.primaryRole,
            submittedAt: data.application.createdAt || new Date().toISOString(),
          };
          markBrowserAsSubmitted(record);
          setBrowserRecord(record);
          toast.info(data.message || "You have already submitted an application.");
          return;
        }

        if (
          data?.errors &&
          typeof data.errors === "object" &&
          Object.keys(data.errors).length > 0
        ) {
          setFieldErrors(data.errors);
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstKey];
          const el = document.querySelector(`[data-field="${firstKey}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            (el as HTMLElement).focus?.();
          }
          throw new Error(firstMsg);
        }
        throw new Error(
          data?.message || data?.error || "Failed to submit application."
        );
      }

      const record: SubmittedRecord = {
        id: data.application.id,
        fullName: form.fullName,
        email: form.email,
        primaryRole: form.primaryRole,
        submittedAt: data.application.createdAt || new Date().toISOString(),
      };
      markBrowserAsSubmitted(record);
      setBrowserRecord(record);
      toast.success("Application submitted successfully.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit application.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName: string) =>
    `w-full h-10 px-3 bg-white border text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
      fieldErrors[fieldName]
        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20"
        : "border-slate-300 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
    }`;

  const getTextareaClass = (fieldName: string) =>
    `w-full p-3 bg-white border text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
      fieldErrors[fieldName]
        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20"
        : "border-slate-300 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
    }`;

  const labelClass = "block text-[13px] font-medium text-slate-800 mb-1.5";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Minimalist Navbar — ONLY JITU LOGO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/blue-jitu-logo.png"
              alt="JITU"
              width={36}
              height={24}
              priority
              className="h-6 w-auto object-contain"
            />
            <span className="font-display font-extrabold text-[20px] tracking-[-0.025em] text-blue-900 leading-none">
              jitu<span className="text-blue-600">.</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* SECTION 1: Header Picture (Indonesian SMA students achieving PTN + layered blue tone) */}
        <section aria-label="Header banner">
          <div className="relative w-full h-[180px] sm:h-[230px] overflow-hidden bg-[#061844]">
            <img
              src="/hiring-header-photo.jpg?v=5"
              alt="JITU Open Hiring 2026"
              className="w-full h-full object-cover object-[center_52%] grayscale contrast-105 brightness-100"
            />
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80"
              style={{
                background:
                  "linear-gradient(90deg, #0D3894 0%, #2563EB 42%, #0A2E7A 100%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(6,22,62,0.10) 0%, rgba(6,22,62,0.24) 100%)",
              }}
            />
          </div>
        </section>

        {/* SECTION 2: Title and Short Explanation */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-[12px] font-mono">
              <span className="uppercase tracking-[0.08em] text-blue-700 font-semibold">
                Part-Time · Remote
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200/90 text-amber-900 font-semibold text-[11px] uppercase tracking-[0.06em]">
                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Deadline: 30 October 2026</span>
              </span>
            </div>
            <h1 className="font-display text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              JITU Open Hiring 2026
            </h1>
          </div>

          <p className="text-[16px] font-semibold text-slate-900">
            What if your organizational experience actually paid off?
          </p>

          <div className="space-y-3 text-[14px] sm:text-[15px] text-slate-600 leading-relaxed">
            <p>
              We&apos;ve all seen it:{" "}
              <strong className="font-bold text-slate-900">
                working long hours, organizing events, chasing sponsorships, and
                taking on responsibilities, all for the sake of a certificate
                and another line on your CV.
              </strong>{" "}
              What if you could put that same energy into building something
              that creates actual economic value?
            </p>
            <p>
              At JITU, we&apos;re building an early-stage EdTech startup from the
              ground up, developing products for Indonesia&apos;s education
              ecosystem while growing a sustainable business.{" "}
              <strong className="font-bold text-slate-900">
                We&apos;re looking for people who want to take ownership, gain
                hands-on startup experience, and share in the value they help
                create.
              </strong>
            </p>
            <p>
              <strong className="font-bold text-slate-900">
                If you&apos;re looking for something beyond organizational
                experience with zero chance of economic return, this place is for
                you.
              </strong>
            </p>
          </div>

          <div className="pt-2">
            <h2 className="text-[13px] sm:text-[14px] font-mono uppercase tracking-[0.08em] text-blue-700 font-semibold mb-3">
              What You Get
            </h2>
            <ul className="flex flex-col gap-2.5 text-[15px] sm:text-[16px] text-blue-700 font-normal leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>First-hand experience building an early-stage startup.</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>
                  Individual profit-sharing under mutually agreed terms.
                </span>
              </li>
              <li className="flex items-start gap-2.5 font-bold">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>
                  Transition to fixed compensation as milestones are achieved.
                </span>
              </li>
              <li className="flex items-start gap-2.5 font-bold">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>
                  All roles are profit-sharing first, with fixed salary offered once milestones are achieved.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>Real ownership and responsibilities.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>Room to grow in technology, product, and business.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-700 text-[18px] leading-none mt-0.5">•</span>
                <span>Part-time and remote arrangement.</span>
              </li>
            </ul>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* SECTION 3: Open Positions (8 Positions Available) */}
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[19px] sm:text-[20px] font-bold text-slate-900">
              Open Positions
            </h2>
            <span className="text-[12px] font-mono text-slate-500">
              8 positions available
            </span>
          </div>

          <div className="space-y-6">
            {HIRING_DIVISIONS.map((division) => {
              const roles = HIRING_POSITIONS.filter(
                (p) => p.division === division
              );
              return (
                <div key={division} className="space-y-2.5">
                  <h3 className="text-[11.5px] font-mono uppercase tracking-[0.08em] font-semibold text-blue-700">
                    {division}
                  </h3>
                  <div className="space-y-2.5">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="w-full text-left bg-white border border-slate-200/90 shadow-xs p-4 sm:p-5"
                      >
                        <div className="text-[12px] text-slate-500 font-medium">
                          {role.division}
                        </div>
                        <h4 className="font-serif text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug mt-1">
                          {role.title}
                        </h4>
                        <p className="text-[13.5px] text-slate-600 leading-relaxed mt-1.5">
                          {role.summary}
                        </p>
                        <div className="flex items-center justify-between gap-3 text-[12px] text-slate-500 mt-3.5 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              Remote | Part-Time | {role.slots}{" "}
                              {role.slots > 1 ? "Positions" : "Position"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={scrollToForm}
                            className="text-[12px] font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                          >
                            Apply now →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* SECTION 4: Application Form */}
        <section ref={formRef} className="space-y-6 pb-12">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[18px] font-bold text-slate-900">
                Application Form
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.05em] text-amber-800 bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 font-semibold">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>Deadline: 30 October 2026</span>
              </span>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              Complete the form below to apply. Fields marked with * are
              required. Applications close on <strong>30 October 2026</strong>.
            </p>
          </div>

          {browserRecord ? (
            <div className="border border-blue-900 bg-blue-50/40 p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-blue-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-[18px] text-slate-900 leading-tight">
                      Application Already Submitted
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      This browser is registered with an active submission.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-900 text-[11px] font-mono uppercase tracking-[0.06em] font-semibold self-start sm:self-auto border border-blue-200">
                  <Lock className="w-3 h-3 text-blue-800" />
                  <span>1 Submission / Candidate</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-300 p-3.5 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-slate-500 block">
                    Candidate
                  </span>
                  <span className="text-[14px] font-bold text-slate-900 block truncate">
                    {browserRecord.fullName}
                  </span>
                </div>
                <div className="bg-white border border-slate-300 p-3.5 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-slate-500 block">
                    Applied Position
                  </span>
                  <span className="text-[14px] font-bold text-slate-900 block truncate">
                    {browserRecord.primaryRole}
                  </span>
                </div>
                <div className="bg-white border border-slate-300 p-3.5 space-y-1 flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-slate-500 block">
                      Reference ID
                    </span>
                    <span className="font-mono text-[14px] font-bold text-blue-900 block">
                      {browserRecord.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(browserRecord.id);
                      setCopiedId(true);
                      toast.success("Reference ID copied to clipboard!");
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[13.5px] text-slate-700 leading-relaxed space-y-2 pt-1">
                <p>
                  Thank you! Your application has been recorded in our hiring database. To ensure fair and comprehensive evaluation for every candidate, multiple submissions for this cycle are disabled.
                </p>
                <p className="text-[12.5px] text-slate-500">
                  Our team reviews profiles on a rolling basis and will reach out via WhatsApp or email if your qualifications align with the role.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="fullName">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Your full name"
                    className={getInputClass("fullName")}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>
                <div data-field="email">
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="name@email.com"
                    className={getInputClass("email")}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="whatsapp">
                  <label className={labelClass}>
                    WhatsApp Number *{" "}
                    <span className="text-[11px] text-slate-400 font-normal">
                      (min. 8 digits)
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className={getInputClass("whatsapp")}
                  />
                  {fieldErrors.whatsapp && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.whatsapp}
                    </p>
                  )}
                </div>
                <div data-field="domicile">
                  <label className={labelClass}>Current Domicile (City) *</label>
                  <input
                    type="text"
                    required
                    value={form.domicile}
                    onChange={(e) => updateField("domicile", e.target.value)}
                    placeholder="e.g. Jakarta, Bandung, Depok"
                    className={getInputClass("domicile")}
                  />
                  {fieldErrors.domicile && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.domicile}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div data-field="university">
                  <label className={labelClass}>University / Institution *</label>
                  <input
                    type="text"
                    required
                    value={form.university}
                    onChange={(e) => updateField("university", e.target.value)}
                    placeholder="e.g. Universitas Indonesia"
                    className={getInputClass("university")}
                  />
                  {fieldErrors.university && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.university}
                    </p>
                  )}
                </div>
                <div data-field="major">
                  <label className={labelClass}>Major / Department *</label>
                  <input
                    type="text"
                    required
                    value={form.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    placeholder="e.g. Computer Science"
                    className={getInputClass("major")}
                  />
                  {fieldErrors.major && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.major}
                    </p>
                  )}
                </div>
                <div data-field="academicStatus">
                  <label className={labelClass}>Current Status *</label>
                  <select
                    value={form.academicStatus}
                    onChange={(e) =>
                      updateField("academicStatus", e.target.value)
                    }
                    className={getInputClass("academicStatus")}
                  >
                    <option value="Active Undergraduate (S1/D4)">
                      Undergraduate (S1/D4)
                    </option>
                    <option value="Fresh Graduate">Fresh Graduate</option>
                    <option value="Professional / Early Career">
                      Early Career
                    </option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.academicStatus && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.academicStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Position & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div data-field="primaryRole">
                  <label className={labelClass}>Primary Position *</label>
                  <select
                    required
                    value={form.primaryRole}
                    onChange={(e) => updateField("primaryRole", e.target.value)}
                    className={getInputClass("primaryRole")}
                  >
                    <option value="">Select primary position...</option>
                    {HIRING_POSITIONS.map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title} — {pos.division}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.primaryRole && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.primaryRole}
                    </p>
                  )}
                </div>
                <div data-field="secondaryRole">
                  <label className={labelClass}>
                    Secondary Position (Optional)
                  </label>
                  <select
                    value={form.secondaryRole}
                    onChange={(e) =>
                      updateField("secondaryRole", e.target.value)
                    }
                    className={getInputClass("secondaryRole")}
                  >
                    <option value="">None</option>
                    {HIRING_POSITIONS.filter(
                      (pos) => pos.title !== form.primaryRole
                    ).map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title} — {pos.division}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.secondaryRole && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.secondaryRole}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="availability">
                  <label className={labelClass}>Weekly Availability *</label>
                  <select
                    value={form.availability}
                    onChange={(e) =>
                      updateField("availability", e.target.value)
                    }
                    className={getInputClass("availability")}
                  >
                    <option value="10–15 hours/week">10–15 hours/week</option>
                    <option value="15–20 hours/week">15–20 hours/week</option>
                    <option value="20–25 hours/week">20–25 hours/week</option>
                    <option value="25+ hours/week">25+ hours/week</option>
                  </select>
                </div>
                <div data-field="startDate">
                  <label className={labelClass}>Earliest Start Date *</label>
                  <select
                    value={form.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className={getInputClass("startDate")}
                  >
                    <option value="Immediately">Immediately</option>
                    <option value="Within 1 week">Within 1 week</option>
                    <option value="Within 2 weeks">Within 2 weeks</option>
                    <option value="Next month">Next month</option>
                  </select>
                </div>
              </div>

              {/* CV & Links */}
              <div className="space-y-4 pt-2">
                <div data-field="cvUrl">
                  <label className={labelClass}>
                    CV / Resume Link (Google Drive, Notion, etc.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.cvUrl}
                    onChange={(e) => updateField("cvUrl", e.target.value)}
                    placeholder="https://drive.google.com/... or public document link"
                    className={getInputClass("cvUrl")}
                  />
                  {fieldErrors.cvUrl ? (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.cvUrl}
                    </p>
                  ) : (
                    <p className="text-[12px] text-slate-500 mt-1">
                      Please ensure the link sharing permission is set to &ldquo;Anyone with the link can view&rdquo;.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-field="portfolioUrl">
                    <label className={labelClass}>
                      Portfolio / GitHub / Proof of Work Link
                    </label>
                    <input
                      type="text"
                      value={form.portfolioUrl}
                      onChange={(e) =>
                        updateField("portfolioUrl", e.target.value)
                      }
                      placeholder="https://github.com/... or portfolio link"
                      className={getInputClass("portfolioUrl")}
                    />
                  </div>
                  <div data-field="linkedinUrl">
                    <label className={labelClass}>LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={form.linkedinUrl}
                      onChange={(e) =>
                        updateField("linkedinUrl", e.target.value)
                      }
                      placeholder="https://linkedin.com/in/..."
                      className={getInputClass("linkedinUrl")}
                    />
                  </div>
                </div>
              </div>

              {/* Short Essays */}
              <div className="space-y-4 pt-2">
                <div data-field="experienceEssay">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-[13px] font-medium text-slate-800">
                      Relevant Experience &amp; Track Record *
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {form.experienceEssay.length} / 15 chars min
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={form.experienceEssay}
                    onChange={(e) =>
                      updateField("experienceEssay", e.target.value)
                    }
                    placeholder="Briefly share the most impactful project, product, or organizational initiative you've built or led, and the concrete results achieved."
                    className={getTextareaClass("experienceEssay")}
                  />
                  {fieldErrors.experienceEssay && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.experienceEssay}
                    </p>
                  )}
                </div>

                <div data-field="motivationEssay">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-[13px] font-medium text-slate-800">
                      Why JITU &amp; Value Creation *
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {form.motivationEssay.length} / 15 chars min
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={form.motivationEssay}
                    onChange={(e) =>
                      updateField("motivationEssay", e.target.value)
                    }
                    placeholder="Why do you want to join JITU in this role, and how will you help create tangible value in your first 90 days?"
                    className={getTextareaClass("motivationEssay")}
                  />
                  {fieldErrors.motivationEssay && (
                    <p className="mt-1 text-[12px] text-red-600 font-medium">
                      {fieldErrors.motivationEssay}
                    </p>
                  )}
                </div>
              </div>

              {/* Commitment & Submit */}
              <div className="pt-2 space-y-4">
                <div data-field="commitmentAgreed">
                  <label className="flex items-start gap-2.5 text-[13px] text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={form.commitmentAgreed}
                      onChange={(e) =>
                        updateField("commitmentAgreed", e.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-blue-900"
                    />
                    <span>
                      I understand that JITU is an early-stage startup offering a
                      part-time, remote arrangement with individual profit-sharing
                      opportunities and potential transition to fixed compensation
                      as key milestones are achieved.
                    </span>
                  </label>
                  {fieldErrors.commitmentAgreed && (
                    <p className="mt-1.5 text-[12px] text-red-600 font-medium">
                      {fieldErrors.commitmentAgreed}
                    </p>
                  )}
                </div>

                {Object.keys(fieldErrors).length > 0 && (
                  <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 text-[13px] space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Please check and correct the following items:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[12px] text-red-700">
                      {Object.entries(fieldErrors).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 bg-blue-900 hover:bg-blue-800 text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
