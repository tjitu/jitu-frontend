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
    `w-full h-11 px-3.5 rounded-md bg-surface border text-[14px] text-text placeholder:text-text-subtle focus:outline-none transition-colors ${
      fieldErrors[fieldName]
        ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger-soft bg-danger-soft/30"
        : "border-border hover:border-ink-300 focus:border-primary focus:ring-3 focus:ring-blue-200"
    }`;

  const getTextareaClass = (fieldName: string) =>
    `w-full p-3.5 rounded-md bg-surface border text-[14px] text-text placeholder:text-text-subtle focus:outline-none transition-colors ${
      fieldErrors[fieldName]
        ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger-soft bg-danger-soft/30"
        : "border-border hover:border-ink-300 focus:border-primary focus:ring-3 focus:ring-blue-200"
    }`;

  const labelClass = "block text-[13px] font-medium text-text mb-1.5";

  return (
    <div className="min-h-screen bg-bg text-text-body">
      {/* Minimalist Navbar — ONLY JITU LOGO */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/blue-jitu-logo.png"
              alt="JITU"
              width={36}
              height={24}
              priority
              className="h-6 w-auto object-contain"
            />
            <span className="font-bold text-[20px] tracking-[-0.025em] text-text leading-none">
              jitu<span className="text-primary">.</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* SECTION 1: Header Picture (full-color, rounded-lg, 1px border per design.md §6) */}
        <section aria-label="Header banner">
          <div className="relative w-full h-[180px] sm:h-[230px] rounded-lg border border-border overflow-hidden bg-surface-muted">
            <img
              src="/hiring-header-photo.jpg?v=5"
              alt="JITU Open Hiring 2026"
              className="w-full h-full object-cover object-[center_52%]"
            />
          </div>
        </section>

        {/* SECTION 2: Title and Short Explanation */}
        <section className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="h-6 rounded-full bg-blue-50 text-blue-800 px-2.5 text-[12px] font-semibold inline-flex items-center">
                Part-time · Remote
              </span>
              <span className="h-6 rounded-full bg-yellow-100 text-yellow-700 px-2.5 text-[12px] font-semibold inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Deadline: 30 October 2026</span>
              </span>
            </div>
            <h1 className="text-h1 font-bold text-text">
              JITU Open Hiring 2026
            </h1>
          </div>

          <p className="text-[16px] font-semibold text-text">
            What if your organizational experience actually paid off?
          </p>

          <div className="space-y-3 text-[15px] text-text-body leading-relaxed">
            <p>
              We&apos;ve all seen it:{" "}
              <strong className="font-semibold text-text">
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
              <strong className="font-semibold text-text">
                We&apos;re looking for people who want to take ownership, gain
                hands-on startup experience, and share in the value they help
                create.
              </strong>
            </p>
            <p>
              <strong className="font-semibold text-text">
                If you&apos;re looking for something beyond organizational
                experience with zero chance of economic return, this place is for
                you.
              </strong>
            </p>
          </div>

          <div className="pt-2">
            <h2 className="text-label text-primary mb-3">
              WHAT YOU GET
            </h2>
            <ul className="flex flex-col gap-2.5 text-[15px] text-text-body leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>First-hand experience building an early-stage startup.</span>
              </li>
              <li className="flex items-start gap-2.5 font-semibold text-text">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  Individual profit-sharing under mutually agreed terms.
                </span>
              </li>
              <li className="flex items-start gap-2.5 font-semibold text-text">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  Transition to fixed compensation as milestones are achieved.
                </span>
              </li>
              <li className="flex items-start gap-2.5 font-semibold text-text">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  All roles are profit-sharing first, with fixed salary offered once milestones are achieved.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Real ownership and responsibilities.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Room to grow in technology, product, and business.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Part-time and remote arrangement.</span>
              </li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* SECTION 3: Open Positions (8 Positions Available) */}
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[20px] font-bold text-text">
              Open positions
            </h2>
            <span className="text-[12px] font-mono text-text-muted">
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
                  <h3 className="text-label text-primary">
                    {division}
                  </h3>
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="w-full text-left bg-surface rounded-lg border border-border hover:border-blue-300 transition-colors p-5"
                      >
                        <div className="text-[12px] text-text-muted font-medium">
                          {role.division}
                        </div>
                        <h4 className="text-[18px] sm:text-[20px] font-bold text-text tracking-[-0.015em] leading-snug mt-1">
                          {role.title}
                        </h4>
                        <p className="text-[14px] text-text-body leading-relaxed mt-1.5">
                          {role.summary}
                        </p>
                        <div className="flex items-center justify-between gap-3 text-[12px] text-text-muted mt-3.5 pt-3 border-t border-border">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                            <span>
                              Remote · Part-Time · {role.slots}{" "}
                              {role.slots > 1 ? "positions" : "position"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={scrollToForm}
                            className="text-[13px] font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer"
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

        <hr className="border-border" />

        {/* SECTION 4: Application Form */}
        <section ref={formRef} className="space-y-6 pb-12">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[20px] font-bold text-text">
                Application form
              </h2>
              <span className="h-6 rounded-full inline-flex items-center gap-1.5 text-[12px] text-yellow-700 bg-yellow-100 px-2.5 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Deadline: 30 October 2026</span>
              </span>
            </div>
            <p className="text-[13px] text-text-muted mt-1">
              Complete the form below to apply. Fields marked with * are
              required. Applications close on <strong>30 October 2026</strong>.
            </p>
          </div>

          {browserRecord ? (
            <div className="rounded-lg border border-border bg-surface p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-bold text-[18px] text-text leading-tight">
                      Application already submitted
                    </h3>
                    <p className="text-[12px] text-text-muted mt-0.5">
                      This browser is registered with an active submission.
                    </p>
                  </div>
                </div>
                <div className="h-6 rounded-full inline-flex items-center gap-1.5 px-2.5 bg-blue-50 text-blue-800 text-[12px] font-semibold self-start sm:self-auto">
                  <Lock className="w-3 h-3" />
                  <span>1 submission / candidate</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-surface-muted rounded-md border border-border p-3.5 space-y-1">
                  <span className="text-label text-text-muted block">
                    Candidate
                  </span>
                  <span className="text-[14px] font-bold text-text block truncate">
                    {browserRecord.fullName}
                  </span>
                </div>
                <div className="bg-surface-muted rounded-md border border-border p-3.5 space-y-1">
                  <span className="text-label text-text-muted block">
                    Applied position
                  </span>
                  <span className="text-[14px] font-bold text-text block truncate">
                    {browserRecord.primaryRole}
                  </span>
                </div>
                <div className="bg-surface-muted rounded-md border border-border p-3.5 space-y-1 flex items-start justify-between">
                  <div>
                    <span className="text-label text-text-muted block">
                      Reference ID
                    </span>
                    <span className="font-mono text-[14px] font-bold text-primary block">
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
                    className="p-1.5 rounded-sm text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[13.5px] text-text-body leading-relaxed space-y-2 pt-1">
                <p>
                  Thank you! Your application has been recorded in our hiring database. To ensure fair and comprehensive evaluation for every candidate, multiple submissions for this cycle are disabled.
                </p>
                <p className="text-[12.5px] text-text-muted">
                  Our team reviews profiles on a rolling basis and will reach out via WhatsApp or email if your qualifications align with the role.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-border p-6 sm:p-8 space-y-5">
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="fullName">
                  <label className={labelClass}>Full name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Your full name"
                    className={getInputClass("fullName")}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>
                <div data-field="email">
                  <label className={labelClass}>Email address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="name@email.com"
                    className={getInputClass("email")}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="whatsapp">
                  <label className={labelClass}>
                    WhatsApp number *{" "}
                    <span className="text-[12px] text-text-muted font-normal">
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.whatsapp}
                    </p>
                  )}
                </div>
                <div data-field="domicile">
                  <label className={labelClass}>Current domicile (city) *</label>
                  <input
                    type="text"
                    required
                    value={form.domicile}
                    onChange={(e) => updateField("domicile", e.target.value)}
                    placeholder="e.g. Jakarta, Bandung, Depok"
                    className={getInputClass("domicile")}
                  />
                  {fieldErrors.domicile && (
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.domicile}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div data-field="university">
                  <label className={labelClass}>University / institution *</label>
                  <input
                    type="text"
                    required
                    value={form.university}
                    onChange={(e) => updateField("university", e.target.value)}
                    placeholder="e.g. Universitas Indonesia"
                    className={getInputClass("university")}
                  />
                  {fieldErrors.university && (
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.university}
                    </p>
                  )}
                </div>
                <div data-field="major">
                  <label className={labelClass}>Major / department *</label>
                  <input
                    type="text"
                    required
                    value={form.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    placeholder="e.g. Computer Science"
                    className={getInputClass("major")}
                  />
                  {fieldErrors.major && (
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.major}
                    </p>
                  )}
                </div>
                <div data-field="academicStatus">
                  <label className={labelClass}>Current status *</label>
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.academicStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Position & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div data-field="primaryRole">
                  <label className={labelClass}>Primary position *</label>
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.primaryRole}
                    </p>
                  )}
                </div>
                <div data-field="secondaryRole">
                  <label className={labelClass}>
                    Secondary position (optional)
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.secondaryRole}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="availability">
                  <label className={labelClass}>Weekly availability *</label>
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
                  <label className={labelClass}>Earliest start date *</label>
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
                    CV / resume link (Google Drive, Notion, etc.) *
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.cvUrl}
                    </p>
                  ) : (
                    <p className="text-[12px] text-text-muted mt-1">
                      Please ensure the link sharing permission is set to &ldquo;Anyone with the link can view&rdquo;.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-field="portfolioUrl">
                    <label className={labelClass}>
                      Portfolio / GitHub / proof of work link
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
                    <label className={labelClass}>LinkedIn profile URL</label>
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
                    <label className="text-[13px] font-medium text-text">
                      Relevant experience &amp; track record *
                    </label>
                    <span className="text-[11px] text-text-muted font-mono">
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.experienceEssay}
                    </p>
                  )}
                </div>

                <div data-field="motivationEssay">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-[13px] font-medium text-text">
                      Why JITU &amp; value creation *
                    </label>
                    <span className="text-[11px] text-text-muted font-mono">
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
                    <p className="mt-1 text-[12px] text-danger font-medium">
                      {fieldErrors.motivationEssay}
                    </p>
                  )}
                </div>
              </div>

              {/* Commitment & Submit */}
              <div className="pt-2 space-y-4">
                <div data-field="commitmentAgreed">
                  <label className="flex items-start gap-2.5 text-[13px] text-text-body cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={form.commitmentAgreed}
                      onChange={(e) =>
                        updateField("commitmentAgreed", e.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span>
                      I understand that JITU is an early-stage startup offering a
                      part-time, remote arrangement with individual profit-sharing
                      opportunities and potential transition to fixed compensation
                      as key milestones are achieved.
                    </span>
                  </label>
                  {fieldErrors.commitmentAgreed && (
                    <p className="mt-1.5 text-[12px] text-danger font-medium">
                      {fieldErrors.commitmentAgreed}
                    </p>
                  )}
                </div>

                {Object.keys(fieldErrors).length > 0 && (
                  <div className="p-3.5 rounded-md bg-danger-soft border border-danger/30 text-danger-text text-[13px] space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                      <span>Please check and correct the following items:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[12px]">
                      {Object.entries(fieldErrors).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 transition-colors"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isSubmitting ? "Submitting..." : "Submit application"}
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
