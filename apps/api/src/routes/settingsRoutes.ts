import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ok } from "../lib/apiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAdmin, requireRole } from "../middleware/auth";
import { auditMetaFrom } from "../lib/audit";
import { getAllSettings, updateSettings } from "../services/settingsService";
import { testSmtpConnection } from "../services/emailService";

export const settingsRoutes = Router();
settingsRoutes.use(requireAdmin, requireRole(["OWNER", "MANAGER"]));

settingsRoutes.get("/admin/settings", asyncHandler(async (_req, res) => {
  res.json(ok(await getAllSettings(prisma)));
}));

settingsRoutes.patch("/admin/settings", requireRole(["OWNER", "MANAGER"]), asyncHandler(async (req, res) => {
  const patch = z.record(z.string(), z.unknown()).parse(req.body);
  res.json(ok(await updateSettings(prisma, req.adminUser!, patch, auditMetaFrom(req))));
}));

settingsRoutes.post("/admin/settings/test-email", requireRole(["OWNER", "MANAGER"]), asyncHandler(async (req, res) => {
  const testSchema = z.object({
    recipientEmail: z.string().email().optional(),
  });
  const parsed = testSchema.parse(req.body || {});
  const result = await testSmtpConnection(parsed.recipientEmail);
  res.json(ok(result));
}));
