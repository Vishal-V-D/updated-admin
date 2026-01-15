# 🔐 Clerk Configuration Guide

Complete step-by-step guide to configure Clerk for the Admin-Managed User System.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clerk Dashboard Configuration](#clerk-dashboard-configuration)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Creating Your First Admin User](#creating-your-first-admin-user)
5. [Testing the Setup](#testing-the-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Clerk account (sign up at [clerk.com](https://clerk.com))
- Node.js installed (v18 or higher)
- This project cloned and dependencies installed

---

## Clerk Dashboard Configuration

### Step 1: Create a New Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"Create Application"**
3. Enter your application name (e.g., "Admin Dashboard")
4. Click **"Create Application"**

---

### Step 2: Configure Authentication Methods

Navigate to: **Configure → Email, Phone, Username**

#### ✅ **Email Address Settings**

**Required Settings:**

- ✅ **Enable Email Address**: `ON`
- ✅ **Require Email Address**: `ON` (Make it mandatory)
- ✅ **Verify Email Address**: `ON` (Enable email verification)
- ✅ **Verification Method**: Select **"Email code"** or **"Email link"**

**Optional (Recommended):**
- ✅ **Used for sign-in**: `ON`

#### ❌ **Phone Number Settings**

- ❌ **Disable Phone Number**: `OFF` (Not needed for this setup)

#### ❌ **Username Settings**

- ❌ **Disable Username**: `OFF` (Not needed for this setup)

#### ✅ **Password Settings**

**Important Configuration:**

- ✅ **Enable Password**: `ON`
- ✅ **Require Password**: `OFF` ⚠️ **CRITICAL** - Must be OFF for passwordless login
- ✅ **Allow users to sign in without password**: `ON` (Enable magic link login)

---

### Step 3: Configure Social Connections (Optional)

Navigate to: **Configure → Social Connections**

**For this setup, you can:**
- ❌ Keep all social providers **disabled** (Google, GitHub, etc.)
- OR ✅ Enable specific providers if you want OAuth login

**Recommended:** Keep disabled for admin-only system.

---

### Step 4: Configure Restrictions

Navigate to: **Configure → Restrictions**

#### ✅ **Sign-up Restrictions** (CRITICAL)

**Required Settings:**

- ✅ **Restrict sign-ups**: `ON` ⚠️ **MUST BE ENABLED**
- ✅ **Restriction mode**: Select **"Allowlist"** or **"Invitation only"**

**Recommended:** Use **"Allowlist"** mode

**Why?** This prevents public sign-ups and ensures only admin-created users can access the system.

#### ✅ **Allowlist Configuration**

If using Allowlist mode:
- You can manually add email addresses/domains that are allowed to sign up
- Leave empty initially (admins will create users via the dashboard)

#### ❌ **Session Settings** (Keep Default)

Navigate to: **Configure → Sessions**

- ✅ **Multi-session handling**: `Active session` (default)
- ✅ **Session lifetime**: `7 days` (default, adjust as needed)

---

### Step 5: Configure Paths

Navigate to: **Configure → Paths**

**Required Settings:**

- ✅ **Sign-in URL**: `/auth/sign-in`
- ✅ **Sign-up URL**: Leave empty or set to `/auth/sign-in` (sign-up is disabled)
- ✅ **After sign-in URL**: `/dashboard`
- ✅ **After sign-up URL**: `/dashboard`

---

### Step 6: Email & SMS Settings

Navigate to: **Configure → Email & SMS**

#### ✅ **Email Provider**

**Default (Clerk's Email Service):**
- ✅ Use Clerk's built-in email service (recommended for testing)

**Custom Email Provider (Optional):**
- If you want custom branding, configure:
  - Resend
  - SendGrid
  - Mailgun
  - Custom SMTP

#### ✅ **Email Templates**

Navigate to: **Configure → Email & SMS → Templates**

**Customize these templates (optional but recommended):**

1. **Verification Email**
   - Subject: "Verify your email for [App Name]"
   - Body: Include verification link/code

2. **Magic Link Email** (IMPORTANT)
   - Subject: "Sign in to [App Name]"
   - Body: Include magic link for passwordless login

3. **Password Reset Email**
   - Subject: "Reset your password"
   - Body: Include reset link

---

### Step 7: User & Authentication Settings

Navigate to: **Configure → User & Authentication**

#### ✅ **User Profile**

**Required Fields:**
- ✅ **Email Address**: Required
- ✅ **First Name**: Optional (but recommended)
- ✅ **Last Name**: Optional (but recommended)

#### ✅ **Metadata**

**Public Metadata (CRITICAL):**
- ✅ Ensure **Public Metadata** is enabled
- This is where we store the `role` field (`admin`, `user`, etc.)

**How to verify:**
1. Go to **Users** in Clerk Dashboard
2. Click on any user
3. Check if you can edit **Public Metadata**
4. It should allow JSON like: `{ "role": "admin" }`

---

### Step 8: API Keys

Navigate to: **API Keys**

**Copy these keys to your `.env` file:**

1. **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)
   - Used in frontend
   - Safe to expose in client-side code

2. **Secret Key** (starts with `sk_test_...` or `sk_live_...`)
   - Used in backend/server actions
   - ⚠️ **NEVER expose this in client-side code**

---

## Environment Variables Setup

Create a `.env.local` file in your project root:

```env
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
```

**Important:**
- Replace `pk_test_xxx` and `sk_test_xxx` with your actual keys from Clerk Dashboard
- Do NOT commit `.env.local` to Git (it's in `.gitignore`)

---

## Creating Your First Admin User

### Option 1: Using the Admin Creation Script (Recommended)

1. **Ensure environment variables are set** in `.env` or `.env.local`

2. **Run the script:**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

3. **Follow the prompts:**
   - Enter email address
   - Enter first name
   - Enter last name
   - (Optional) Enter password or leave blank for passwordless

4. **Verify:**
   - Check Clerk Dashboard → Users
   - User should have `{ "role": "admin" }` in Public Metadata

### Option 2: Manual Creation via Clerk Dashboard

1. Go to **Clerk Dashboard → Users**
2. Click **"Create User"**
3. Fill in:
   - Email address
   - First name
   - Last name
   - (Optional) Password
4. Click **"Create"**
5. **IMPORTANT:** Click on the newly created user
6. Scroll to **"Public Metadata"**
7. Click **"Edit"**
8. Add:
   ```json
   {
     "role": "admin"
   }
   ```
9. Click **"Save"**

---

## Testing the Setup

### 1. Test Sign-In

1. Start your development server:
   ```bash
   pnpm run dev
   ```

2. Navigate to: `http://localhost:3000/auth/sign-in`

3. **Test Passwordless Login:**
   - Enter your admin email
   - Click "Continue with email"
   - Check your inbox for magic link
   - Click the link
   - You should be redirected to `/dashboard`

4. **Test Password Login (if you set a password):**
   - Enter email and password
   - Click "Sign in"
   - You should be redirected to `/dashboard`

### 2. Test User Management

1. Navigate to: `http://localhost:3000/dashboard/users`

2. **Verify:**
   - ✅ You can see the User Management page
   - ✅ Your admin user is listed
   - ✅ Role shows as "admin"

3. **Test Creating a New User:**
   - Click **"Invite User"**
   - Fill in email, first name, last name
   - Click **"Send Invitation"**
   - Check the new user's email inbox
   - They should receive a "Set Your Password" email from Clerk

### 3. Test Access Control

1. **Sign out** from your admin account

2. **Try to access** `/dashboard/users` without being logged in
   - ✅ Should redirect to `/auth/sign-in`

3. **Sign in as admin**
   - ✅ Should be able to access `/dashboard/users`

---

## Troubleshooting

### Issue: "Invitations are not supported"

**Solution:**
- Ensure **Email Address** is enabled in Clerk Dashboard
- Check that **Sign-up Restrictions** are properly configured
- We now use **Direct User Creation** instead of invitations, so this error should not appear

### Issue: "User is redirected to /dashboard instead of /dashboard/users"

**Solution:**
- This is expected if the user doesn't have the `admin` role
- Check Public Metadata in Clerk Dashboard
- Ensure `{ "role": "admin" }` is set correctly

### Issue: "Cannot read properties of undefined (reading 'role')"

**Solution:**
- The session might not have refreshed
- **Sign out and sign in again**
- Clerk caches session data in JWT tokens
- Metadata changes require a new session

### Issue: "User created but no email received"

**Solution:**
- Check Clerk Dashboard → Email & SMS → Email Logs
- Verify email templates are enabled
- Check spam/junk folder
- Ensure email provider is configured correctly

### Issue: "skipPasswordRequirement is not supported"

**Solution:**
- Ensure **"Require Password"** is set to `OFF` in Clerk Dashboard
- This allows users to be created without passwords
- Users can then use magic link login

---

## Summary Checklist

Before going live, ensure:

- ✅ Email authentication is enabled
- ✅ Password is optional (not required)
- ✅ Sign-up restrictions are enabled (Allowlist/Invitation only)
- ✅ Sign-in URL is set to `/auth/sign-in`
- ✅ After sign-in URL is set to `/dashboard`
- ✅ Environment variables are set in `.env.local`
- ✅ At least one admin user exists with `role: "admin"` in Public Metadata
- ✅ Email templates are configured (optional but recommended)
- ✅ Session lifetime is configured appropriately

---

## Need Help?

- **Clerk Documentation**: [https://clerk.com/docs](https://clerk.com/docs)
- **Clerk Support**: [https://clerk.com/support](https://clerk.com/support)
- **Project Documentation**: See `ADMIN_USER_SYSTEM.md` for system overview

---

**Last Updated:** January 15, 2026
