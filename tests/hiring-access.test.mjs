import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAdminAccess } from "../lib/admin-access.ts";
import { toPublicTrackRecord } from "../lib/hiring-public.ts";

test("anonymous callers are asked to sign in", () => {
  for (const user of [null, undefined]) {
    assert.deepEqual(evaluateAdminAccess(user), {
      ok: false,
      status: 401,
      message: "Autentikasi diperlukan.",
    });
  }
});

test("signed-in users who are not admins are forbidden", () => {
  for (const role of ["USER", "", null, undefined, "ADMINISTRATOR", "SUPERADMIN", " ADMIN "]) {
    const result = evaluateAdminAccess({ role });
    assert.equal(result.ok, false, `role ${JSON.stringify(role)} must not pass`);
    assert.equal(result.status, 403);
  }
});

test("admins pass, regardless of letter case", () => {
  assert.deepEqual(evaluateAdminAccess({ role: "ADMIN" }), { ok: true });
  assert.deepEqual(evaluateAdminAccess({ role: "admin" }), { ok: true });
});

test("the public tracking record exposes only status information", () => {
  const record = toPublicTrackRecord({
    id: "JITU-123",
    fullName: "Nama Pelamar",
    email: "pelamar@example.com",
    whatsapp: "081234567890",
    university: "Universitas Contoh",
    major: "Informatika",
    domicile: "Jakarta",
    primaryRole: "Content Writer",
    primaryDivision: "Content",
    secondaryRole: "Designer",
    availability: "10-20 jam",
    startDate: "2026-11-01",
    cvUrl: "https://example.com/cv.pdf",
    portfolioUrl: "https://example.com/p",
    linkedinUrl: "https://example.com/l",
    experienceEssay: "esai",
    motivationEssay: "motivasi",
    adminNotes: "catatan internal",
    status: "UNDER_REVIEW",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
  });
  assert.deepEqual(Object.keys(record).sort(), [
    "createdAt",
    "id",
    "primaryDivision",
    "primaryRole",
    "status",
    "updatedAt",
  ]);
  const serialized = JSON.stringify(record);
  for (const secret of ["pelamar@example.com", "081234567890", "Universitas Contoh", "catatan internal", "cv.pdf", "Nama Pelamar"]) {
    assert.ok(!serialized.includes(secret), `${secret} must not be exposed`);
  }
});
