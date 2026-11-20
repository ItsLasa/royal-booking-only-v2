import { PrismaClient } from "@prisma/client";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env";
import fs from "fs";
import path from "path";

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let resendClient: Resend | null = null;

/**
 * Return cached Resend client instance if RESEND_API_KEY is configured.
 */
export function getResendClient(): Resend | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Reset Resend client (useful in unit testing or configuration reloads).
 */
export function resetResendClient(): void {
  resendClient = null;
}

/**
 * Log email errors to both console and persistent log files for cPanel Passenger debugging.
 */
export function logEmailError(prefix: string, err: any) {
  const errMsg = err?.stack || err?.message || String(err);
  let hint = "";
  if (typeof errMsg === "string" && errMsg.includes("ENOTFOUND")) {
    hint = "\n👉 [cPanel Hint] DNS resolution failed for SMTP host. If running on cPanel, set SMTP_HOST=localhost or SMTP_HOST=127.0.0.1 in your .env to connect to local Exim without DNS lookups.";
  }
  const line = `[${new Date().toISOString()}] ❌ [email-nodemailer] ${prefix}: ${errMsg}${hint}\n`;
  try {
    const emailLogDir = path.resolve(process.cwd(), "logs/emails");
    if (!fs.existsSync(emailLogDir)) fs.mkdirSync(emailLogDir, { recursive: true });
    fs.appendFileSync(path.join(emailLogDir, "email_errors.log"), line);
  } catch (_) {}
  try {
    fs.appendFileSync(path.resolve(process.cwd(), "api.err.log"), line);
  } catch (_) {}
  console.error(line.trim());
}

let cachedTransporter: Transporter | null = null;

/**
 * Reset cached transporter (useful when environment variables change or after connection failure).
 */
export function resetCachedTransporter(): void {
  cachedTransporter = null;
}

/**
 * Resolve the sender address for outgoing emails (Resend or Nodemailer).
 */
export function getDefaultFromEmail(): string {
  if (env.EMAIL_FROM && env.EMAIL_FROM.trim().length > 0) {
    const trimmed = env.EMAIL_FROM.trim();
    if (trimmed.includes("<") && trimmed.includes(">")) {
      return trimmed;
    }
    if (trimmed.includes("@")) {
      return `Royal Mansion Resort <${trimmed}>`;
    }
    return trimmed;
  }

  // If using Resend without explicit EMAIL_FROM
  if (env.RESEND_API_KEY && !env.SMTP_USER) {
    return "Royal Mansion Resort <onboarding@resend.dev>";
  }

  if (env.SMTP_USER && env.SMTP_USER.includes("@")) {
    return `Royal Mansion Resort <${env.SMTP_USER}>`;
  }
  return "Royal Mansion Resort <info.royalmansionresort@gmail.com>";
}

/**
 * Create or return a cached Nodemailer SMTP transporter.
 * Returns null if SMTP configuration is not provided.
 */
export function getEmailTransporter(): Transporter | null {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const hasConfig = Boolean(env.SMTP_USER && env.SMTP_PASS && (env.SMTP_HOST || env.SMTP_SERVICE));
  if (!hasConfig) {
    return null;
  }

  const transportOptions: Record<string, any> = {
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: env.SMTP_TIMEOUT_MS,
    greetingTimeout: 10000,
    socketTimeout: env.SMTP_TIMEOUT_MS,
  };

  if (env.SMTP_SERVICE) {
    transportOptions.service = env.SMTP_SERVICE;
  } else if (env.SMTP_HOST) {
    transportOptions.host = env.SMTP_HOST;
    transportOptions.port = env.SMTP_PORT || 587;
    const isPort465 = Number(env.SMTP_PORT) === 465;
    transportOptions.secure = Boolean(env.SMTP_SECURE || isPort465);
  }

  // Support cPanel self-signed and shared certificates
  transportOptions.tls = {
    rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED,
  };

  try {
    cachedTransporter = nodemailer.createTransport(transportOptions);
    return cachedTransporter;
  } catch (err) {
    logEmailError("Failed to initialize Nodemailer transporter", err);
    return null;
  }
}

/**
 * Verify SMTP transport connection (useful for health checks & debugging).
 */
export async function verifyEmailTransport(): Promise<boolean> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn("⚠️ [email-nodemailer] Cannot verify: SMTP transporter is not configured.");
    return false;
  }
  try {
    await transporter.verify();
    console.log("✅ [email-nodemailer] SMTP transport connection verified successfully.");
    return true;
  } catch (err) {
    resetCachedTransporter();
    console.error("❌ [email-nodemailer] SMTP verification failed:", err);
    return false;
  }
}

/**
 * Send an email with automatic error handling, cache reset, and localhost (127.0.0.1)
 * fallback on cPanel when external DNS resolution fails (ENOTFOUND).
 */
export async function sendMailWithFallback(
  mailOptions: Parameters<Transporter["sendMail"]>[0]
): Promise<any> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("SMTP transporter is not configured");
  }

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err: any) {
    const isDnsError =
      err?.code === "ENOTFOUND" ||
      err?.syscall === "getaddrinfo" ||
      (typeof err?.message === "string" && err.message.includes("ENOTFOUND"));

    // Invalidate cached transporter on any connection or DNS error
    resetCachedTransporter();

    // If DNS failed on a domain host on cPanel, fallback to local Exim mail server (127.0.0.1)
    if (
      isDnsError &&
      env.SMTP_HOST &&
      env.SMTP_HOST !== "localhost" &&
      env.SMTP_HOST !== "127.0.0.1" &&
      env.SMTP_USER &&
      env.SMTP_PASS
    ) {
      console.warn(
        `⚠️ [email-nodemailer] DNS resolution failed for "${env.SMTP_HOST}". Attempting automatic fallback to local cPanel mail server (127.0.0.1)...`
      );
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: "127.0.0.1",
          port: env.SMTP_PORT || 465,
          secure: Boolean(env.SMTP_SECURE || Number(env.SMTP_PORT) === 465),
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: env.SMTP_TIMEOUT_MS,
          greetingTimeout: 10000,
          socketTimeout: env.SMTP_TIMEOUT_MS,
        });

        const fallbackResult = await fallbackTransporter.sendMail(mailOptions);
        console.log(`✅ [email-nodemailer] Delivered email via local cPanel fallback (127.0.0.1).`);
        return fallbackResult;
      } catch (fallbackErr) {
        logEmailError("Local cPanel fallback (127.0.0.1) also failed", fallbackErr);
      }
    }

    throw err;
  }
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  sent: boolean;
  provider?: "resend" | "nodemailer" | "logged";
  messageId?: string;
  error?: string;
}

/**
 * Generic helper to send an email with automatic provider selection:
 * 1. Resend API (HTTPS REST) if RESEND_API_KEY is configured.
 * 2. Nodemailer SMTP if SMTP credentials are configured.
 * 3. Local file log backup in logs/emails/ (offline/dev fallback).
 */
export async function sendEmail(options: SendMailOptions): Promise<SendEmailResult> {
  const from = options.from || getDefaultFromEmail();

  // Always write backup to disk
  try {
    const emailLogDir = path.resolve(process.cwd(), "logs/emails");
    if (!fs.existsSync(emailLogDir)) fs.mkdirSync(emailLogDir, { recursive: true });
    const emailFile = path.join(emailLogDir, `mail_${Date.now()}.html`);
    fs.writeFileSync(emailFile, options.html, "utf-8");
  } catch {
    // Ignore log dir write errors
  }

  // 1. Try Resend if configured
  const resend = getResendClient();
  if (resend) {
    try {
      const toRecipients = Array.isArray(options.to) ? options.to : [options.to];
      const { data, error } = await resend.emails.send({
        from,
        to: toRecipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        logEmailError(`[email-resend] Resend API error for ${toRecipients.join(", ")}`, error);
      } else if (data?.id) {
        console.log(`✅ [email-resend] Mail delivered to ${toRecipients.join(", ")} (Resend ID: ${data.id})`);
        return { sent: true, provider: "resend", messageId: data.id };
      }
    } catch (err: any) {
      logEmailError(`[email-resend] Resend dispatch exception for ${options.to}`, err);
    }
  }

  // 2. Fallback to Nodemailer SMTP if configured
  const transporter = getEmailTransporter();
  if (transporter) {
    try {
      const info = await sendMailWithFallback({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log(`✅ [email-nodemailer] Mail delivered to ${options.to} (ID: ${info.messageId})`);
      return { sent: true, provider: "nodemailer", messageId: info.messageId };
    } catch (err: any) {
      console.error(`❌ [email-nodemailer] Failed sending email to ${options.to}:`, err);
      return { sent: false, provider: "nodemailer", error: err?.message || String(err) };
    }
  }

  if (!resend && !transporter) {
    console.warn(`ℹ️ [email] No active email provider (RESEND_API_KEY or SMTP) configured. Recorded email locally to logs/emails/.`);
    return { sent: false, provider: "logged", error: "No email provider configured in .env" };
  }

  return { sent: false, error: "Failed to dispatch email across available providers" };
}

/**
 * Send complete booking summary and confirmation email to guest and admin alert.
 * Uses Resend API when RESEND_API_KEY is available, falling back to Nodemailer SMTP.
 */
export async function sendBookingSummaryEmail(prisma: PrismaClient, bookingIdOrRef: string): Promise<boolean> {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingIdOrRef }, { reference: bookingIdOrRef }],
      },
      include: {
        guest: true,
        package: true,
        priceLines: true,
        addOns: true,
        payments: true,
      },
    });

    if (!booking || !booking.guest?.email) {
      console.warn(`[email] Booking or guest email not found for ${bookingIdOrRef}`);
      return false;
    }

    const checkIn = new Date(booking.checkInDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const lkr = (val: number | any) =>
      `LKR ${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const guestNameRaw = `${booking.guest.firstName} ${booking.guest.lastName}`.trim();
    const guestName = escapeHtml(guestNameRaw);
    const guestEmailRaw = booking.guest.email;
    const guestEmail = escapeHtml(guestEmailRaw);
    const guestPhone = escapeHtml(booking.guest.phone);
    const guestCountry = escapeHtml(booking.guest.country);
    const specialRequests = escapeHtml(booking.specialRequests);
    const packageName = escapeHtml(booking.package?.name ?? "Royal Mansion Villa Package");
    const safeRef = escapeHtml(booking.reference);
    const fromEmail = getDefaultFromEmail();
    const subject = `Booking Summary & Confirmation - ${booking.reference} | Royal Mansion Resort Villa`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; color: #1a1c1c; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #061b0e; color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
    .header p { margin: 0; color: #d0e9d4; font-size: 14px; }
    .badge { display: inline-block; background: #cba72f; color: #061b0e; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin-top: 16px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #061b0e; }
    .intro { font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #735c00; margin-bottom: 14px; }
    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table td { padding: 8px 0; border-bottom: 1px solid #edf2f7; }
    .table td:first-child { color: #718096; width: 45%; }
    .table td:last-child { font-weight: 600; color: #1a202c; text-align: right; }
    .price-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px; }
    .price-table td { padding: 8px 0; border-bottom: 1px solid #edf2f7; }
    .price-table .total-row td { border-top: 2px solid #061b0e; border-bottom: none; font-size: 16px; font-weight: bold; color: #061b0e; padding-top: 12px; }
    .price-table .deposit-row td { color: #735c00; font-weight: 600; }
    .notice { background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 18px; margin-bottom: 24px; font-size: 14px; color: #065f46; border-radius: 0 4px 4px 0; }
    .footer { background: #f1f5f9; padding: 24px; text-align: center; font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; }
    .footer a { color: #061b0e; text-decoration: underline; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Royal Mansion Resort Villa</h1>
      <p>Pussallawa, Sri Lanka</p>
      <div class="badge">Booking Ref: ${safeRef}</div>
    </div>
    <div class="content">
      <div class="greeting">Dear ${guestName},</div>
      <p class="intro">
        Thank you for reserving your stay at Royal Mansion Resort Villa. Your booking submission has been received successfully! Below is your complete reservation and payment summary.
      </p>

      <div class="notice">
        <strong>Booking Submission Received!</strong><br />
        Our reservations team is verifying your payment slip / transaction confirmation and will finalize your stay details.
      </div>

      <div class="card">
        <div class="card-title">Stay & Guest Details</div>
        <table class="table">
          <tr><td>Package</td><td>${packageName}</td></tr>
          <tr><td>Check-in Date</td><td>${checkIn} (from 14:00)</td></tr>
          <tr><td>Check-out Date</td><td>${checkOut} (until 11:00)</td></tr>
          <tr><td>Duration</td><td>${booking.nights} Night${booking.nights > 1 ? "s" : ""}</td></tr>
          <tr><td>Guests</td><td>${booking.adults} Adults${booking.children > 0 ? `, ${booking.children} Children` : ""}</td></tr>
          <tr><td>Guest Email</td><td>${guestEmail}</td></tr>
          <tr><td>Guest Phone</td><td>${guestPhone}</td></tr>
          ${guestCountry ? `<tr><td>Country</td><td>${guestCountry}</td></tr>` : ""}
          ${specialRequests ? `<tr><td>Special Requests</td><td>${specialRequests}</td></tr>` : ""}
        </table>
      </div>

      <div class="card">
        <div class="card-title">Booking Price Breakdown</div>
        <table class="price-table">
          ${booking.priceLines.map((l) => `<tr><td>${escapeHtml(l.description)}</td><td style="text-align: right;">${lkr(l.totalAmount)}</td></tr>`).join("")}
          <tr class="total-row"><td>Grand Total</td><td style="text-align: right;">${lkr(booking.grandTotal)}</td></tr>
          <tr class="deposit-row"><td>Deposit Required / Paid</td><td style="text-align: right;">${lkr(booking.depositRequired)}</td></tr>
          <tr><td>Balance Due on Arrival</td><td style="text-align: right;">${lkr(booking.balanceDue)}</td></tr>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Resort Location & Contact</div>
        <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
          <strong>Royal Mansion Resort Villa</strong><br />
          No.21, Prime Panoramic, Paradeka, Pussallawa, Sri Lanka<br />
          Phone / WhatsApp: +94 76 400 1245<br />
          Email: info.royalmansionresort@gmail.com
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Royal Mansion Resort Villa. All rights reserved.</p>
      <p>Have questions? Email us directly at <a href="mailto:info.royalmansionresort@gmail.com">info.royalmansionresort@gmail.com</a> or call +94 76 400 1245.</p>
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `
Royal Mansion Resort Villa - Booking Summary
Reference: ${booking.reference}
Guest: ${guestName} (${booking.guest.email})
Package: ${booking.package?.name ?? "Royal Mansion Villa Package"}
Check-in: ${checkIn} (from 14:00)
Check-out: ${checkOut} (until 11:00)
Guests: ${booking.adults} Adults${booking.children > 0 ? `, ${booking.children} Children` : ""}
Grand Total: ${lkr(booking.grandTotal)}
Deposit: ${lkr(booking.depositRequired)}
Balance Due on Arrival: ${lkr(booking.balanceDue)}

Location: No.21, Prime Panoramic, Paradeka, Pussallawa, Sri Lanka
Contact: +94 76 400 1245 | info.royalmansionresort@gmail.com
    `.trim();

    const adminEmail =
      env.ADMIN_NOTIFICATION_EMAIL && !env.ADMIN_NOTIFICATION_EMAIL.includes("example.test")
        ? env.ADMIN_NOTIFICATION_EMAIL
        : undefined;

    let guestSent = false;
    let adminSent = false;
    let usedProvider: "resend" | "nodemailer" | "logged" = "logged";
    let guestMessageId: string | undefined;
    let adminMessageId: string | undefined;

    // 1. Send confirmation to Guest
    try {
      const guestResult = await sendEmail({
        from: fromEmail,
        to: guestEmailRaw,
        subject,
        html,
        text: plainText,
      });
      guestSent = guestResult.sent;
      if (guestResult.provider) usedProvider = guestResult.provider;
      guestMessageId = guestResult.messageId;
      if (guestSent) {
        console.log(`✅ [email] Booking summary delivered to guest: ${guestEmailRaw} (${booking.reference}) via ${usedProvider}`);
      }
    } catch (guestErr) {
      logEmailError(`Failed to deliver booking summary to guest (${guestEmailRaw})`, guestErr);
    }

    // 2. Send notification to Resort Admin
    if (adminEmail && adminEmail.toLowerCase() !== guestEmailRaw.toLowerCase()) {
      try {
        const adminHtml = `
          <div style="background:#f0fdf4;border:1px solid #86efac;padding:12px 16px;margin-bottom:16px;border-radius:6px;font-family:sans-serif;font-size:13px;color:#166534;">
            <strong>Admin Notification:</strong> A new booking submission was received from <strong>${guestName}</strong> (${guestEmail}, phone: ${guestPhone}).
          </div>
          ${html}
        `;
        const adminResult = await sendEmail({
          from: fromEmail,
          to: adminEmail,
          subject: `[Admin Alert - Guest: ${guestNameRaw}] ${subject}`,
          html: adminHtml,
          text: `[Admin Alert: New booking from ${guestNameRaw} (${guestEmailRaw})]\n\n${plainText}`,
        });
        adminSent = adminResult.sent;
        if (adminResult.provider) usedProvider = adminResult.provider;
        adminMessageId = adminResult.messageId;
        if (adminSent) {
          console.log(`✅ [email] Booking alert delivered to admin: ${adminEmail} (${booking.reference}) via ${usedProvider}`);
        }
      } catch (adminErr) {
        logEmailError(`Failed to deliver booking alert to admin (${adminEmail})`, adminErr);
      }
    }

    // 3. Persist a backup copy in logs/emails/
    try {
      const emailLogDir = path.resolve(process.cwd(), "logs/emails");
      if (!fs.existsSync(emailLogDir)) fs.mkdirSync(emailLogDir, { recursive: true });
      const emailFile = path.join(emailLogDir, `${booking.reference}_${Date.now()}.html`);
      fs.writeFileSync(emailFile, html, "utf-8");
      console.log(`📁 [email] Booking summary recorded to ${emailFile}`);
    } catch {
      // Ignore file log write issues
    }

    // 4. Record in Prisma audit log
    await prisma.auditLog
      .create({
        data: {
          action: "BOOKING_SUMMARY_EMAIL_SENT",
          entityType: "Booking",
          entityId: booking.reference,
          newValues: {
            to: guestEmail,
            subject,
            delivery: guestSent || adminSent ? "SENT" : "LOGGED",
            guestDelivered: guestSent,
            adminDelivered: adminSent,
            service: usedProvider,
            guestMessageId,
            adminMessageId,
          },
        },
      })
      .catch(() => null);

    return true;
  } catch (err) {
    logEmailError("Error in sendBookingSummaryEmail", err);
    return false;
  }
}

/**
 * Diagnostic test for active email provider (Resend or SMTP).
 * Verifies connection and optionally sends a live test message.
 */
export async function testSmtpConnection(targetEmail?: string): Promise<{
  success: boolean;
  message: string;
  provider?: "resend" | "nodemailer" | "none";
  diagnostics: {
    provider?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    tlsRejectUnauthorized?: boolean;
    verified?: boolean;
    sent?: boolean;
    messageId?: string;
    error?: string;
  };
}> {
  // If RESEND_API_KEY is configured, test Resend
  const resend = getResendClient();
  if (resend) {
    const from = getDefaultFromEmail();
    const recipient = targetEmail || env.ADMIN_NOTIFICATION_EMAIL || "delivered@resend.dev";
    const diag: any = {
      provider: "resend",
      host: "api.resend.com",
      user: env.RESEND_API_KEY ? `${env.RESEND_API_KEY.slice(0, 5)}...` : undefined,
      verified: true,
      sent: false,
    };

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [recipient],
        subject: `[Diagnostic Test] Royal Mansion Resort Villa - Resend ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;">
            <h2 style="color:#061b0e;margin-top:0;">✅ Resend Email Delivery Verified</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;">
              This is a live test email from <strong>Royal Mansion Resort Villa</strong> sent via <strong>Resend.com API</strong>.
              Your transactional email dispatch system is operational!
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;font-size:14px;color:#334155;">
              <div><strong>Provider:</strong> Resend REST API (HTTPS)</div>
              <div><strong>From Sender:</strong> ${escapeHtml(from)}</div>
              <div><strong>Delivered To:</strong> ${escapeHtml(recipient)}</div>
              <div><strong>Server Time:</strong> ${new Date().toISOString()}</div>
            </div>
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              Royal Mansion Resort Villa · Automated Email Diagnostics
            </p>
          </div>
        `,
        text: `Resend Email Delivery Verified!\nSent to: ${recipient}\nTimestamp: ${new Date().toISOString()}`,
      });

      if (error) {
        const errorMsg = error.message || "Unknown error from Resend API";
        return {
          success: false,
          provider: "resend",
          message: `Resend dispatch failed: ${errorMsg}`,
          diagnostics: { ...diag, error: errorMsg },
        };
      }

      diag.sent = true;
      diag.messageId = data?.id;
      return {
        success: true,
        provider: "resend",
        message: `Test email successfully dispatched via Resend to ${recipient}! (Message ID: ${data?.id})`,
        diagnostics: diag,
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      return {
        success: false,
        provider: "resend",
        message: `Resend test threw exception: ${errMsg}`,
        diagnostics: { ...diag, error: errMsg },
      };
    }
  }

  // Fallback to testing SMTP
  resetCachedTransporter();

  const host = env.SMTP_HOST || env.SMTP_SERVICE || "Not configured";
  const port = env.SMTP_PORT || (env.SMTP_SERVICE ? 465 : 587);
  const secure = env.SMTP_SECURE || port === 465;
  const user = env.SMTP_USER ? `${env.SMTP_USER.slice(0, 3)}***` : "Not configured";

  const diag: any = {
    provider: "nodemailer",
    host,
    port,
    secure,
    user,
    tlsRejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED,
    verified: false,
    sent: false,
  };

  const transporter = getEmailTransporter();
  if (!transporter) {
    const errorMsg = "Neither RESEND_API_KEY nor SMTP credentials (SMTP_USER, SMTP_PASS, SMTP_HOST) are configured in .env.";
    logEmailError("testSmtpConnection", errorMsg);
    return {
      success: false,
      provider: "none",
      message: errorMsg,
      diagnostics: { ...diag, error: errorMsg },
    };
  }

  // 1. Verify connection
  try {
    await transporter.verify();
    diag.verified = true;
  } catch (verifyErr: any) {
    resetCachedTransporter();
    const errText = verifyErr?.message || String(verifyErr);
    logEmailError("testSmtpConnection verification failed", verifyErr);
    return {
      success: false,
      provider: "nodemailer",
      message: `SMTP Connection / Auth Failed: ${errText}`,
      diagnostics: { ...diag, error: errText },
    };
  }

  // 2. Dispatch test message
  const recipient = targetEmail || env.ADMIN_NOTIFICATION_EMAIL || env.SMTP_USER;
  if (!recipient) {
    return {
      success: true,
      provider: "nodemailer",
      message: "SMTP connection & authentication verified successfully! (No recipient specified for test dispatch)",
      diagnostics: diag,
    };
  }

  try {
    const from = getDefaultFromEmail();
    const info = await sendMailWithFallback({
      from,
      to: recipient,
      subject: `[Diagnostic Test] Royal Mansion Resort Villa - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#061b0e;margin-top:0;">✅ SMTP Connection Verified</h2>
          <p style="color:#475569;font-size:15px;line-height:1.6;">
            This is a live test email from <strong>Royal Mansion Resort Villa</strong> sent from your cPanel server.
            If you received this email, your outgoing email delivery system is functioning correctly!
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;font-size:14px;color:#334155;">
            <div><strong>SMTP Host:</strong> ${host}</div>
            <div><strong>SMTP Port:</strong> ${port} (Secure/SSL: ${secure ? "Yes" : "No"})</div>
            <div><strong>TLS Reject Unauthorized:</strong> ${env.SMTP_TLS_REJECT_UNAUTHORIZED ? "Yes" : "No (cPanel compatible)"}</div>
            <div><strong>From Sender:</strong> ${escapeHtml(from)}</div>
            <div><strong>Delivered To:</strong> ${escapeHtml(recipient)}</div>
            <div><strong>Server Time:</strong> ${new Date().toISOString()}</div>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            Royal Mansion Resort Villa · Automated Diagnostic Engine
          </p>
        </div>
      `,
      text: `SMTP Connection Verified!\nHost: ${host}:${port}\nSent to: ${recipient}\nTimestamp: ${new Date().toISOString()}`,
    });
    diag.sent = true;
    diag.messageId = info.messageId;
    return {
      success: true,
      provider: "nodemailer",
      message: `Test email successfully dispatched to ${recipient}! (Message ID: ${info.messageId})`,
      diagnostics: diag,
    };
  } catch (sendErr: any) {
    const errText = sendErr?.message || String(sendErr);
    logEmailError(`testSmtpConnection sending to ${recipient}`, sendErr);
    return {
      success: false,
      provider: "nodemailer",
      message: `Connected successfully, but test email sending failed: ${errText}`,
      diagnostics: { ...diag, error: errText },
    };
  }
}

export const testEmailConnection = testSmtpConnection;

