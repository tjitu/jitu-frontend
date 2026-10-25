import { NextRequest, NextResponse } from "next/server";
import { getAllApplications, saveAllApplications } from "@/lib/hiring-store";
import { ApplicationStatus } from "@/lib/hiring-types";

const VALID_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const applications = await getAllApplications();
    const index = applications.findIndex(
      (app) => app.id.toLowerCase() === id.toLowerCase()
    );

    if (index === -1) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    if (body.status && VALID_STATUSES.includes(body.status)) {
      applications[index].status = body.status;
    }

    if (typeof body.adminNotes === "string") {
      applications[index].adminNotes = body.adminNotes.trim();
    }

    applications[index].updatedAt = new Date().toISOString();
    await saveAllApplications(applications);

    return NextResponse.json({
      message: "Application updated.",
      application: applications[index],
    });
  } catch (error) {
    console.error("PATCH /api/hiring/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update application." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const applications = await getAllApplications();
    const filtered = applications.filter(
      (app) => app.id.toLowerCase() !== id.toLowerCase()
    );

    if (filtered.length === applications.length) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    await saveAllApplications(filtered);
    return NextResponse.json({ message: "Application deleted." });
  } catch (error) {
    console.error("DELETE /api/hiring/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete application." },
      { status: 500 }
    );
  }
}

