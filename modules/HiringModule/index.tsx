"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { HIRING_DIVISIONS, HIRING_POSITIONS } from "@/lib/hiring-types";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.primaryRole) {
      toast.error("Please select a primary position.");
      return;
    }
    if (!form.cvUrl.trim()) {
      toast.error("Please provide your CV / Resume link.");
      return;
    }
    if (!form.commitmentAgreed) {
      toast.error("Please confirm the arrangement agreement.");
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
        const errorMsg =
          data?.message ||
          (data?.errors ? Object.values(data.errors)[0] : null) ||
          data?.error ||
          "Failed to submit application.";
        throw new Error(errorMsg as string);
      }

      setSubmittedId(data.application.id);
      toast.success("Application submitted successfully.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit application.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-10 px-3 bg-white border border-slate-300 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-colors";
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
          <div className="space-y-1">
            <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-blue-700 font-semibold">
              Part-Time · Remote
            </p>
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
            <h2 className="font-display text-[18px] font-bold text-slate-900">
              Application Form
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Complete the form below to apply. Fields marked with * are
              required.
            </p>
          </div>

          {submittedId ? (
            <div className="border border-blue-900 bg-blue-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-blue-900">
                <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                <h3 className="font-display font-bold text-[18px]">
                  Application Received
                </h3>
              </div>
              <p className="text-[14px] text-slate-700 leading-relaxed">
                Thank you, <strong>{form.fullName}</strong>. Your application
                for <strong>{form.primaryRole}</strong> has been recorded. Our
                team will review your profile and reach out via WhatsApp or
                email.
              </p>
              <div className="inline-block bg-white border border-slate-300 px-3.5 py-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-slate-500 block">
                  Reference ID
                </span>
                <span className="font-mono text-[15px] font-bold text-blue-900">
                  {submittedId}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedId(null);
                    setForm(INITIAL_FORM);
                  }}
                  className="text-[13px] font-medium text-blue-700 hover:underline cursor-pointer"
                >
                  Submit another application
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="name@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="+62 812..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Current Domicile (City) *</label>
                  <input
                    type="text"
                    required
                    value={form.domicile}
                    onChange={(e) => updateField("domicile", e.target.value)}
                    placeholder="e.g. Jakarta, Bandung, Depok"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>University / Institution *</label>
                  <input
                    type="text"
                    required
                    value={form.university}
                    onChange={(e) => updateField("university", e.target.value)}
                    placeholder="e.g. Universitas Indonesia"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Major / Department *</label>
                  <input
                    type="text"
                    required
                    value={form.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Current Status *</label>
                  <select
                    value={form.academicStatus}
                    onChange={(e) =>
                      updateField("academicStatus", e.target.value)
                    }
                    className={inputClass}
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
                </div>
              </div>

              {/* Position & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className={labelClass}>Primary Position *</label>
                  <select
                    required
                    value={form.primaryRole}
                    onChange={(e) => updateField("primaryRole", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select primary position...</option>
                    {HIRING_POSITIONS.map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title} — {pos.division}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Secondary Position (Optional)
                  </label>
                  <select
                    value={form.secondaryRole}
                    onChange={(e) =>
                      updateField("secondaryRole", e.target.value)
                    }
                    className={inputClass}
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Weekly Availability *</label>
                  <select
                    value={form.availability}
                    onChange={(e) =>
                      updateField("availability", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="10–15 hours/week">10–15 hours/week</option>
                    <option value="15–20 hours/week">15–20 hours/week</option>
                    <option value="20–25 hours/week">20–25 hours/week</option>
                    <option value="25+ hours/week">25+ hours/week</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Earliest Start Date *</label>
                  <select
                    value={form.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className={inputClass}
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
                <div>
                  <label className={labelClass}>
                    CV / Resume Link (Google Drive, Notion, etc.) *
                  </label>
                  <input
                    type="url"
                    required
                    value={form.cvUrl}
                    onChange={(e) => updateField("cvUrl", e.target.value)}
                    placeholder="https://drive.google.com/... or public document link"
                    className={inputClass}
                  />
                  <p className="text-[12px] text-slate-500 mt-1">
                    Please ensure the link sharing permission is set to &ldquo;Anyone with the link can view&rdquo;.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Portfolio / GitHub / Proof of Work Link
                    </label>
                    <input
                      type="url"
                      value={form.portfolioUrl}
                      onChange={(e) =>
                        updateField("portfolioUrl", e.target.value)
                      }
                      placeholder="https://github.com/... or portfolio link"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={form.linkedinUrl}
                      onChange={(e) =>
                        updateField("linkedinUrl", e.target.value)
                      }
                      placeholder="https://linkedin.com/in/..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Short Essays */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className={labelClass}>
                    Relevant Experience &amp; Track Record *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.experienceEssay}
                    onChange={(e) =>
                      updateField("experienceEssay", e.target.value)
                    }
                    placeholder="Briefly share the most impactful project, product, or organizational initiative you've built or led, and the concrete results achieved."
                    className="w-full p-3 bg-white border border-slate-300 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-colors"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Why JITU &amp; Value Creation *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.motivationEssay}
                    onChange={(e) =>
                      updateField("motivationEssay", e.target.value)
                    }
                    placeholder="Why do you want to join JITU in this role, and how will you help create tangible value in your first 90 days?"
                    className="w-full p-3 bg-white border border-slate-300 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-colors"
                  />
                </div>
              </div>

              {/* Commitment & Submit */}
              <div className="pt-2 space-y-4">
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
