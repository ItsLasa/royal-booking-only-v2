#!/usr/bin/env node
/**
 * Standalone SMTP Diagnostic Tool for Royal Mansion Resort
 * Usage on cPanel Terminal or Local:
 *   node scripts/test-smtp.js [optional_recipient_email]
 */

const fs = require("fs");
const path = require("path");
const net = require("net");
const dns = require("dns");
const nodemailer = require("nodemailer");

// 1. Multi-path .env loader
function loadEnvironment() {
  const candidateEnvPaths = [
    path.join(__dirname, "..", ".env"),
    path.join(process.cwd(), ".env"),
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", "apps", "api", ".env"),
  ];

  for (const envPath of candidateEnvPaths) {
    if (!fs.existsSync(envPath)) continue;
    try {
      const content = fs.readFileSync(envPath, "utf8");
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1) continue;
        const key = line.slice(0, equalsIndex).trim();
        let value = line.slice(equalsIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined || process.env[key] === "") {
          process.env[key] = value;
        }
      }
      return envPath;
    } catch (_) {}
  }
  return null;
}

const loadedEnv = loadEnvironment();

console.log("\n========================================================");
console.log("   🧪 Royal Mansion Resort Villa - SMTP Diagnostic Tool   ");
console.log("========================================================\n");

if (loadedEnv) {
  console.log(`✅ Loaded environment file: ${loadedEnv}`);
} else {
  console.warn("⚠️  No .env file found. Using process.env.");
}

const host = process.env.SMTP_HOST || "";
const service = process.env.SMTP_SERVICE || "";
const port = parseInt(process.env.SMTP_PORT || "587", 10);
const rawSecure = process.env.SMTP_SECURE;
const isSecure = rawSecure === "true" || rawSecure === "1" || port === 465;
const rawReject = process.env.SMTP_TLS_REJECT_UNAUTHORIZED;
const rejectUnauthorized = rawReject === "true" || rawReject === "1";
const user = process.env.SMTP_USER || "";
const pass = process.env.SMTP_PASS || "";
const from = process.env.EMAIL_FROM || `Royal Mansion Resort <${user}>`;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "";

const targetRecipient = process.argv[2] || adminEmail || user;

console.log("\n📋 Active Configuration:");
console.log(`   • SMTP_HOST:                     ${host || "(not set)"}`);
console.log(`   • SMTP_SERVICE:                  ${service || "(not set)"}`);
console.log(`   • SMTP_PORT:                     ${port}`);
console.log(`   • SMTP_SECURE (SSL):             ${isSecure} (raw: "${rawSecure || ""}")`);
console.log(`   • SMTP_TLS_REJECT_UNAUTHORIZED:  ${rejectUnauthorized} (cPanel recommends: false)`);
console.log(`   • SMTP_USER:                     ${user || "(not set)"}`);
console.log(`   • SMTP_PASS:                     ${pass ? "********" : "(not set)"}`);
console.log(`   • EMAIL_FROM:                    ${from}`);
console.log(`   • Target Recipient:              ${targetRecipient || "(none)"}`);

if (!user || !pass || (!host && !service)) {
  console.error("\n❌ ERROR: Incomplete SMTP configuration.");
  console.error("   Please ensure SMTP_USER, SMTP_PASS, and SMTP_HOST are defined in your .env file.\n");
  process.exit(1);
}

async function runDiagnostics() {
  // Step A: DNS Resolution Check
  if (host && !service) {
    process.stdout.write(`\n1️⃣  Checking DNS resolution for ${host}... `);
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.lookup(host, (err, address) => {
          if (err) reject(err);
          else resolve(address);
        });
      });
      console.log(`✅ OK (${addresses})`);
    } catch (dnsErr) {
      console.log(`❌ FAILED`);
      console.error(`   DNS Error: ${dnsErr.message}`);
      console.error("   👉 Troubleshooting: Verify that your SMTP_HOST is spelled correctly.");
      process.exit(1);
    }

    // Step B: Direct TCP Socket Connectivity Test
    process.stdout.write(`2️⃣  Testing TCP connection to ${host}:${port}... `);
    const socketOk = await new Promise((resolve) => {
      const sock = new net.Socket();
      sock.setTimeout(10000);
      sock.on("connect", () => {
        sock.destroy();
        resolve(true);
      });
      sock.on("timeout", () => {
        sock.destroy();
        resolve("TIMEOUT");
      });
      sock.on("error", (err) => {
        resolve(err.message);
      });
      sock.connect(port, host);
    });

    if (socketOk === true) {
      console.log(`✅ OK (Port ${port} is open and reachable)`);
    } else if (socketOk === "TIMEOUT") {
      console.log(`❌ TIMED OUT`);
      console.error(`   👉 The server could not establish a connection to ${host}:${port} within 10 seconds.`);
      console.error(`   👉 On cPanel: The hosting firewall (CSF) often blocks outbound port ${port}.`);
      console.error(`      • If using port 587, try switching to port 465 with SMTP_SECURE=true.`);
      console.error(`      • If using Gmail, consider using your cPanel domain email (mail.yourdomain.com on port 465).`);
      console.error(`      • Or ask your hosting support to unblock outbound SMTP in CSF firewall.\n`);
      process.exit(1);
    } else {
      console.log(`❌ FAILED (${socketOk})`);
      console.error(`   👉 Could not connect to ${host}:${port}. Verify port and firewall rules.\n`);
      process.exit(1);
    }
  }

  // Step C: Nodemailer Transporter Initialization & Authentication
  process.stdout.write(`3️⃣  Verifying SMTP credentials and TLS handshake... `);
  const transportOptions = {
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized },
  };

  if (service) {
    transportOptions.service = service;
  } else {
    transportOptions.host = host;
    transportOptions.port = port;
    transportOptions.secure = isSecure;
  }

  const transporter = nodemailer.createTransport(transportOptions);

  try {
    await transporter.verify();
    console.log(`✅ OK (Authenticated successfully)`);
  } catch (verifyErr) {
    console.log(`❌ FAILED`);
    console.error(`\n   Handshake / Auth Error: ${verifyErr.message}`);
    if (verifyErr.code === "ESOCKET" || verifyErr.message.includes("wrong version number")) {
      console.error("   👉 Port/SSL mismatch: Port 587 requires SMTP_SECURE=false. Port 465 requires SMTP_SECURE=true.");
    } else if (verifyErr.code === "EAUTH" || verifyErr.responseCode === 535) {
      console.error("   👉 Authentication failed: Check your username and password.");
      console.error("      • For Gmail: You MUST use a 16-character Google 'App Password', not your standard Google password.");
      console.error("      • For cPanel: Username must be your FULL email address (e.g. info@yourdomain.com).");
    } else if (verifyErr.message.includes("certificate") || verifyErr.message.includes("altnames")) {
      console.error("   👉 SSL Certificate mismatch: Add SMTP_TLS_REJECT_UNAUTHORIZED=false to your .env file.");
    }
    process.exit(1);
  }

  // Step D: Send Test Email
  if (!targetRecipient) {
    console.log("\n✨ Diagnostic finished: SMTP credentials are valid and connection succeeded!");
    console.log("   To send a live test message, run: node scripts/test-smtp.js your_email@example.com\n");
    return;
  }

  process.stdout.write(`4️⃣  Dispatching live test email to ${targetRecipient}... `);
  try {
    const info = await transporter.sendMail({
      from,
      to: targetRecipient,
      subject: `[Diagnostic Test] Royal Mansion Resort Villa - ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#061b0e;margin-top:0;">✅ SMTP Outgoing Mail Works!</h2>
          <p style="font-size:14px;color:#334155;line-height:1.6;">
            This email confirms that Royal Mansion Resort Villa is able to dispatch live emails through your mail server.
          </p>
          <div style="background:#f8fafc;padding:12px 16px;border-radius:6px;font-size:13px;color:#475569;margin:16px 0;">
            <div><strong>Server Host:</strong> ${host || service}</div>
            <div><strong>Port:</strong> ${port} (SSL: ${isSecure ? "Yes" : "No"})</div>
            <div><strong>Sent At:</strong> ${new Date().toISOString()}</div>
          </div>
        </div>
      `,
      text: `SMTP Outgoing Mail Works!\nHost: ${host || service}:${port}\nSent: ${new Date().toISOString()}`,
    });
    console.log(`✅ DELIVERED (ID: ${info.messageId})`);
    console.log("\n🎉 ALL TESTS PASSED! Your cPanel deployment is ready to send client and admin booking emails.\n");
  } catch (sendErr) {
    console.log(`❌ FAILED`);
    console.error(`\n   Delivery Error: ${sendErr.message}`);
    process.exit(1);
  }
}

runDiagnostics();
