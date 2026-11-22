import { NextRequest, NextResponse } from "next/server";
import { updateApplication, deleteApplication } from "@/lib/hiring-store";
import { ApplicationStatus } from "@/lib/hiring-types";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { evaluateAdminAccess } from "@/lib/admin-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function denyUnlessAdmin(req: NextRequest): Promise<NextResponse | null> {
  const appUser = await getAuthenticatedAppUser(req).catch(() => null);
  const access = evaluateAdminAccess(appUser);
  if (access.ok) return null;
  return NextResponse.json(
    { message: access.message },
    { status: access.status, headers: { "Cache-Control": "no-store" } }
  );
}

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
  const denied = await denyUnlessAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const status =
      body.status && VALID_STATUSES.includes(body.status)
        ? (body.status as ApplicationStatus)
        : undefined;

    const adminNotes =
      typeof body.adminNotes === "string" ? body.adminNotes.trim() : undefined;

    const updated = await updateApplication(id, { status, adminNotes });

    if (!updated) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application updated.",
      application: updated,
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
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await denyUnlessAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const deleted = await deleteApplication(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Application deleted." });
  } catch (error) {
    console.error("DELETE /api/hiring/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete application." },
      { status: 500 }
    );
  }
}

