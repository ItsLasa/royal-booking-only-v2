import { describe, it, expect, vi, beforeEach } from "vitest";
import nodemailer from "nodemailer";

const resendSendMock = vi.fn().mockResolvedValue({
  data: { id: "resend-msg-abc" },
  error: null,
});

vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: resendSendMock,
      };
    },
  };
});

import {
  getDefaultFromEmail,
  sendEmail,
  sendBookingSummaryEmail,
  testSmtpConnection,
  resetResendClient,
  resetCachedTransporter,
} from "../../src/services/emailService";
import { env } from "../../src/config/env";

describe("Email Service (Resend & Nodemailer)", () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: "smtp-msg-123" });

  beforeEach(() => {
    vi.clearAllMocks();
    resetResendClient();
    resetCachedTransporter();

    // Mock Nodemailer
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: sendMailMock,
      verify: vi.fn().mockResolvedValue(true),
    } as any);
  });

  it("should provide default from email format", () => {
    const from = getDefaultFromEmail();
    expect(from).toBeDefined();
    expect(typeof from).toBe("string");
    expect(from).toContain("Royal Mansion Resort");
  });

  it("should send email via Resend when RESEND_API_KEY is configured", async () => {
    const origKey = env.RESEND_API_KEY;
    (env as any).RESEND_API_KEY = "re_test_key_123";
    resetResendClient();

    const result = await sendEmail({
      to: "guest@example.com",
      subject: "Welcome to Royal Mansion",
      html: "<p>Welcome!</p>",
      text: "Welcome!",
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("resend");
    expect(result.messageId).toBe("resend-msg-abc");
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["guest@example.com"],
        subject: "Welcome to Royal Mansion",
      })
    );

    // Restore
    (env as any).RESEND_API_KEY = origKey;
    resetResendClient();
  });

  it("should fallback to Nodemailer when RESEND_API_KEY is absent", async () => {
    const origKey = env.RESEND_API_KEY;
    (env as any).RESEND_API_KEY = undefined;
    resetResendClient();

    const result = await sendEmail({
      to: "guest@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(result).toBeDefined();
    expect(result.sent).toBe(true);
    expect(result.provider).toBe("nodemailer");
    expect(result.messageId).toBe("smtp-msg-123");
    expect(sendMailMock).toHaveBeenCalled();

    // Restore
    (env as any).RESEND_API_KEY = origKey;
    resetResendClient();
  });

  it("should handle sendBookingSummaryEmail gracefully for non-existent booking", async () => {
    const mockPrisma: any = {
      booking: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    const res = await sendBookingSummaryEmail(mockPrisma, "NONEXISTENT");
    expect(res).toBe(false);
  });

  it("should format and process booking summary email for valid booking via Resend", async () => {
    const origKey = env.RESEND_API_KEY;
    (env as any).RESEND_API_KEY = "re_test_key_123";
    resetResendClient();

    const mockBooking: any = {
      id: "booking-1",
      reference: "RMR-202611-TEST1",
      checkInDate: new Date("2026-12-01"),
      checkOutDate: new Date("2026-12-03"),
      nights: 2,
      adults: 2,
      children: 0,
      grandTotal: 50000,
      depositRequired: 25000,
      balanceDue: 25000,
      package: { name: "Luxury Villa Package" },
      guest: {
        firstName: "Kamal",
        lastName: "Perera",
        email: "kamal@example.test",
        phone: "+94771234567",
      },
      priceLines: [
        { description: "2 Nights Accommodation", totalAmount: 50000 },
      ],
      addOns: [],
      payments: [],
    };

    const mockPrisma: any = {
      booking: {
        findFirst: vi.fn().mockResolvedValue(mockBooking),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
    };

    const res = await sendBookingSummaryEmail(mockPrisma, "RMR-202611-TEST1");
    expect(res).toBe(true);
    expect(mockPrisma.booking.findFirst).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    expect(resendSendMock).toHaveBeenCalled();

    // Restore
    (env as any).RESEND_API_KEY = origKey;
    resetResendClient();
  });

  it("should run testSmtpConnection with Resend diagnostic result when API key is set", async () => {
    const origKey = env.RESEND_API_KEY;
    (env as any).RESEND_API_KEY = "re_test_key_123";
    resetResendClient();

    const res = await testSmtpConnection("diag@example.test");
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.provider).toBe("resend");
    expect(res.diagnostics?.sent).toBe(true);
    expect(res.diagnostics?.messageId).toBe("resend-msg-abc");

    // Restore
    (env as any).RESEND_API_KEY = origKey;
    resetResendClient();
  });
});
