# Complete Guide: Deploying Royal Mansion on cPanel (Node.js App + MySQL)

This step-by-step manual guides you through hosting the complete **Royal Mansion Resort Villa Booking Engine & Website** on any cPanel hosting account using **"Setup Node.js App"** (CloudLinux / Phusion Passenger) and native **MySQL (phpMyAdmin)**.

---

## 🏗️ Architecture Overview

The application is structured to run as a **unified Node.js application** on cPanel:

```
Guest / Admin Browser
      │
      ▼ (HTTPS)
cPanel Web Server (Apache / LiteSpeed)
      │
      ▼ (Phusion Passenger Reverse Proxy)
app.js (cPanel Startup File)
      │
      ▼
Express Server (apps/api/dist/server.js)
      ├─► /api/v1/*   -> Booking Engine & Admin APIs (Prisma Client -> cPanel MySQL)
      ├─► /uploads/*  -> Bank Transfer Slips & Documents
      ├─► /health     -> Health Check Endpoint ({"ok": true})
      └─► /*          -> Next.js Web Frontend (.next / next_build)
```

---

## 📋 Prerequisites Checklist Before You Start

- [ ] A cPanel hosting account with **"Setup Node.js App"** enabled.
- [ ] Node.js **18.x, 20.x, or 22.x** available in cPanel.
- [ ] MySQL database creation access in cPanel.
- [ ] A domain or subdomain pointed to your cPanel account (e.g. `resort.com` or `booking.resort.com`).

---

## Step 1: Create the Deployment Archive Locally

Before uploading to cPanel, compile the application into a production package:

1. Open PowerShell / terminal in the project root:
   ```powershell
   cd "C:\OPEN SOURCE\2026-SEP\royal-mension-full-web-with-admin-booking-engine-v1"
   ```

2. Compile the backend API and Next.js frontend, and generate `cpanel_deploy.zip`:
   ```powershell
   npm run package:cpanel
   ```

3. **Output:** A zip file named **`cpanel_deploy.zip`** will be created in your project root directory.
   - This bundle contains `app.js`, compiled API files (`apps/api/dist/`), compiled Next.js frontend (`.next/` and `next_build/`), public assets (`public/`), `package.json`, `.htaccess`, and `cpanel_database_setup.sql`.

---

## Step 2: Create MySQL Database in cPanel

1. Log in to your **cPanel Dashboard**.
2. Under the **Databases** section, click **MySQL® Database Wizard** (or **MySQL® Databases**).
3. **Step 1 - Create Database:**
   - Enter a name, e.g. `royalmansion`.
   - Your full database name will be: `<cpanel_user>_royalmansion`.
   - Click **Next Step**.
4. **Step 2 - Create Database User:**
   - Enter username, e.g. `dbuser`.
   - Your full username will be: `<cpanel_user>_dbuser`.
   - Use the **Password Generator** to create a strong password (save this password for later).
   - Click **Create User**.
5. **Step 3 - Add User to Database:**
   - Check the box for **ALL PRIVILEGES**.
   - Click **Make Changes** (or **Next Step**).

---

## Step 3: Import Schema & Seed Data in phpMyAdmin

> **Note:** We provide a 1-click SQL script (`cpanel_database_setup.sql`) that creates all 25 tables with indexes, foreign keys, and initial seed data, avoiding any Prisma migration shadow database permission issues on shared hosting.

1. In cPanel, click **phpMyAdmin** under **Databases**.
2. In the left sidebar, click on your newly created database (e.g. `<cpanel_user>_royalmansion`).
3. Click the **Import** tab at the top.
4. Click **Choose File** and select **`cpanel_database_setup.sql`** (located in the project root or inside `cpanel_deploy.zip`).
5. Ensure format is **SQL** and click **Import** (or **Go**).
6. When execution completes, you will see a green banner confirming all tables have been imported:
   - Initial Villa units, Stay Packages, Amenities, Add-ons, and Default Owner account are now populated!

### 🔑 Default Admin Account Created:
- **URL:** `https://yourdomain.com/admin/login`
- **Email:** `owner@royalmansion.lk`
- **Password:** `ChangeMe123!`
- **Role:** `OWNER`

---

## Step 4: Configure "Setup Node.js App" in cPanel

1. In cPanel, scroll to the **Software** section and click **Setup Node.js App**.
2. Click **Create Application**.
3. Fill in the fields:
   - **Node.js version:** Select **20.x** (or **18.x** / **22.x**).
   - **Application mode:** Select **Production**.
   - **Application root:** Enter the directory where the app files will live:
     - If hosting on main domain: `royalmansion` (or your preferred directory name).
   - **Application URL:** Select your domain (e.g. `yourdomain.com`).
   - **Application startup file:** Type **`app.js`**.
4. Click **Create** at the top right.
5. Once created, click **Stop App** temporarily while uploading files.

---

## Step 5: Upload Files to cPanel

1. In cPanel, open **File Manager**.
2. Navigate to your **Application Root** directory created in Step 4 (e.g. `/home/<cpanel_user>/royalmansion`).
3. Click **Upload** in the top toolbar.
4. Select and upload **`cpanel_deploy.zip`**.
5. After the upload completes (100% green bar), return to File Manager.
6. Right-click `cpanel_deploy.zip` and choose **Extract**.
7. Confirm extraction into the current directory.
8. (Optional) Delete the `cpanel_deploy.zip` file after extraction to save disk space.

---

## Step 6: Create and Configure `.env` File

1. In the same directory in File Manager, click **+ File** and name it **`.env`** (ensure "Show Hidden Files" is enabled in File Manager Settings).
2. Right-click `.env` and click **Edit**.
3. Paste the following configuration, replacing the database details and domain with your own:

```dotenv
NODE_ENV=production
PORT=4000

# Your Domain URLs (No trailing slash)
FRONTEND_URL=https://yourdomain.com
API_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api/v1

# cPanel MySQL Database URL (Use localhost or 127.0.0.1)
# Format: mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME
DATABASE_URL="mysql://cpaneluser_dbuser:YourStrongPassword@localhost:3306/cpaneluser_royalmansion"

# Security Secrets (Must be 32+ characters; random strings)
SESSION_SECRET="f68a25c1798e4d2ea5c23e809312bd93e17cf60d37e69a08e"
CRON_SECRET="b4c81023d8431e7890cf2134ae678912ba0987654321efdc"
MANAGE_BOOKING_TOKEN_SECRET="72f3e58914bca8210376129845cd7e2310ab6789"
ICAL_FEED_SECRET="9a7b5c3d1e2f4086512398741029384756abcdef"

# Property Regional Settings
PROPERTY_TIMEZONE="Asia/Colombo"
DEFAULT_CURRENCY="LKR"
BOOKING_HOLD_MINUTES=15

# Payment Gateway (PayHere Sri Lanka)
PAYHERE_MODE=sandbox
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_NOTIFY_URL=https://yourdomain.com/api/v1/payments/payhere/notify
PAYHERE_RETURN_URL=https://yourdomain.com/booking/success
PAYHERE_CANCEL_URL=https://yourdomain.com/booking/cancel
```

4. Click **Save Changes**.

---

## Step 7: Install Dependencies & Launch Application

1. Return to **Setup Node.js App** in cPanel.
2. Under your application, look for the **"Run NPM Install"** button and click it.
   - *Alternative via cPanel Terminal:*
     Copy the source virtual environment command shown at the top of the Node.js page (e.g. `source /home/user/nodevenv/royalmansion/20/bin/activate && cd /home/user/royalmansion`), paste it into cPanel Terminal, and run:
     ```bash
     npm install --omit=dev
     ```
3. Once installation completes, click **Start App** (or **Restart App**).

---

## Step 8: Verify Your Live Deployment

| Test Item | URL to Visit | Expected Result |
|---|---|---|
| **Health Check** | `https://yourdomain.com/health` | Displays `{"ok":true}` |
| **Public Packages API** | `https://yourdomain.com/api/v1/packages` | Returns JSON list of resort packages |
| **Booking Engine** | `https://yourdomain.com/book` | Interactive calendar, packages, and guest form loads |
| **Admin Login** | `https://yourdomain.com/admin/login` | Login page loads; enter `owner@royalmansion.lk` / `ChangeMe123!` to access the Admin Console |

---

## 🛠️ Common Troubleshooting

### 1. `503 Service Unavailable`
- Check `api.err.log` or `stderr.log` in your application root folder via File Manager.
- Ensure `DATABASE_URL` in `.env` has the correct username prefix (`cpaneluser_dbuser`) and password.

### 2. `Access denied for user`
- Verify that the database user was added to the database with **ALL PRIVILEGES** in cPanel MySQL Databases.

### 3. File Uploads (Bank Transfer Slips)
- Ensure the `public/uploads/` directory exists and has permissions `755` so uploaded bank deposit slips can be stored and previewed.

### 4. Admin Password Reset
- If you need to reset the owner password, run this SQL query in phpMyAdmin:
  ```sql
  UPDATE AdminUser 
  SET passwordHash = '$2b$12$mLCU/xqnG9wSuNcEjg2Tb.gmMdPf38PgJEY2icwL0/0bSdKNVthwq' 
  WHERE email = 'owner@royalmansion.lk';
  ```
  *(This sets the password back to `ChangeMe123!`)*.
