import { NextRequest, NextResponse } from "next/server";
import {
  getAllApplications,
  insertApplication,
  generateApplicationId,
  resolveDivision,
  resolvePositionTitle,
} from "@/lib/hiring-store";
import { HiringApplication, HIRING_POSITIONS } from "@/lib/hiring-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const track = searchParams.get("track")?.trim();
    const isAdmin = searchParams.get("admin") === "true";

    const applications = await getAllApplications();

    if (track) {
      const normalized = track.toLowerCase();
      const matched = applications
        .filter(
          (app) =>
            app.id.toLowerCase() === normalized ||
            app.email.toLowerCase() === normalized
        )
        .map((app) => ({
          id: app.id,
          fullName: app.fullName,
          email: app.email,
          university: app.university,
          primaryRole: app.primaryRole,
          primaryDivision: app.primaryDivision,
          secondaryRole: app.secondaryRole,
          availability: app.availability,
          startDate: app.startDate,
          status: app.status,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        }));

      return NextResponse.json({
        found: matched.length > 0,
        applications: matched,
      });
    }

    if (isAdmin) {
      const sorted = [...applications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return NextResponse.json({
        total: sorted.length,
        positions: HIRING_POSITIONS,
        applications: sorted,
      });
    }

    // Default public summary stats
    const roleCounts: Record<string, number> = {};
    for (const app of applications) {
      roleCounts[app.primaryRole] = (roleCounts[app.primaryRole] || 0) + 1;
    }

    return NextResponse.json({
      totalApplications: applications.length,
      positions: HIRING_POSITIONS,
      roleCounts,
    });
  } catch (error) {
    console.error("GET /api/hiring error:", error);
    return NextResponse.json(
      { message: "Failed to load hiring data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const whatsapp = String(body.whatsapp || "").trim();
    const university = String(body.university || "").trim();
    const major = String(body.major || "").trim();
    const academicStatus = String(body.academicStatus || "").trim();
    const domicile = String(body.domicile || "").trim();
    const primaryRoleRaw = String(body.primaryRole || "").trim();
    const secondaryRoleRaw = String(body.secondaryRole || "").trim();
    const availability = String(body.availability || "").trim();
    const startDate = String(body.startDate || "").trim();
    const cvUrl = String(body.cvUrl || "").trim();
    const cvFileName = body.cvFileName ? String(body.cvFileName).trim() : undefined;
    const portfolioUrl = String(body.portfolioUrl || "").trim();
    const linkedinUrl = String(body.linkedinUrl || "").trim();
    const experienceEssay = String(body.experienceEssay || "").trim();
    const motivationEssay = String(body.motivationEssay || "").trim();
    const referralSource = String(body.referralSource || "").trim();
    const commitmentAgreed = Boolean(body.commitmentAgreed);

    const fieldErrors: Record<string, string> = {};

    if (!fullName || fullName.length < 2) {
      fieldErrors.fullName = "Please enter your full name.";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Please enter a valid email address.";
    }
    if (!whatsapp || whatsapp.replace(/\D/g, "").length < 9) {
      fieldErrors.whatsapp = "Please enter an active WhatsApp number (min. 9 digits).";
    }
    if (!university) {
      fieldErrors.university = "Please enter your university, school, or institution.";
    }
    if (!major) {
      fieldErrors.major = "Please enter your major and entry year.";
    }
    if (!academicStatus) {
      fieldErrors.academicStatus = "Please select your current status.";
    }
    if (!domicile) {
      fieldErrors.domicile = "Please enter your city/domicile.";
    }
    if (!primaryRoleRaw) {
      fieldErrors.primaryRole = "Please select your 1st choice position.";
    }
    if (
      secondaryRoleRaw &&
      resolvePositionTitle(secondaryRoleRaw) === resolvePositionTitle(primaryRoleRaw)
    ) {
      fieldErrors.secondaryRole =
        "2nd choice position must be different from your 1st choice.";
    }
    if (!availability) {
      fieldErrors.availability = "Please select your weekly availability.";
    }
    if (!startDate) {
      fieldErrors.startDate = "Please select your earliest start date.";
    }
    if (!cvUrl) {
      fieldErrors.cvUrl = "Please upload your CV/Resume PDF or provide a valid link.";
    }
    if (!experienceEssay || experienceEssay.length < 30) {
      fieldErrors.experienceEssay =
        "Please share your concrete experience or project ownership (min. 30 characters).";
    }
    if (!motivationEssay || motivationEssay.length < 30) {
      fieldErrors.motivationEssay =
        "Please explain why you want to join JITU and the value you will create (min. 30 characters).";
    }
    if (!commitmentAgreed) {
      fieldErrors.commitmentAgreed =
        "Please confirm that you understand the arrangement and profit-sharing terms.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          message: "Please check the highlighted fields and try again.",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const applications = await getAllApplications();
    const existingIds = new Set(applications.map((a) => a.id));
    const now = new Date().toISOString();

    const primaryRole = resolvePositionTitle(primaryRoleRaw);
    const primaryDivision = resolveDivision(primaryRoleRaw);
    const secondaryRole = secondaryRoleRaw
      ? resolvePositionTitle(secondaryRoleRaw)
      : "";

    const newApplication: HiringApplication = {
      id: generateApplicationId(existingIds),
      fullName,
      email,
      whatsapp,
      university,
      major,
      academicStatus,
      domicile,
      primaryRole,
      primaryDivision,
      secondaryRole,
      availability,
      startDate,
      cvUrl,
      cvFileName,
      portfolioUrl,
      linkedinUrl,
      experienceEssay,
      motivationEssay,
      referralSource,
      commitmentAgreed,
      status: "SUBMITTED",
      createdAt: now,
      updatedAt: now,
    };

    await insertApplication(newApplication);

    return NextResponse.json(
      {
        message: "Application submitted successfully.",
        application: newApplication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/hiring error:", error);
    return NextResponse.json(
      { message: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}

