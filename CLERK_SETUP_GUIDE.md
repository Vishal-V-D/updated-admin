# 🚀 Clerk Setup Guide: Admin System

Follow these exact steps to complete your setup.

---

## Part 1: Configure Clerk Dashboard ⚙️

You need to tell Clerk to **stop allowing random people to sign up**.

1. **Log in** to your [Clerk Dashboard](https://dashboard.clerk.com).
2. Select your application.
3. In the sidebar, go to **User & Authentication** > **Email, Phone, Username**.
   - Look for "Email address" settings.
   - **Uncheck** / Disable "Allow users to sign up".
   - *Result*: No one can sign up from the login page anymore.
4. In the sidebar, go to **User & Authentication** > **Restrictions**.
   - Look for **"Invitation only mode"**.
   - Toggle it **ON** (Enable).
   - *Result*: Only people you invite via email can create accounts.

---

## Part 2: Create The First Admin User 👑

Since your app now requires you to be an `admin` to create users, you can't use the app to create the *first* admin. You must do this manually in Clerk.

1. In the Clerk Dashboard sidebar, clicking on **Users**.
2. Click the **"Create user"** button (usually top right).
3. **Fill in the details**:
   - **Email**: Enter your email address.
   - **Name**: Enter your name.
   - **Password**: You can set a temporary password or leave it blank (if you leave it blank, you'll need to use the email Magic Link to sign in first).
   - Click **Create**.

---

## Part 3: Assign Admin Role 🛡️

This is the **most important step**. Just creating a user isn't enough; you must tell the system this user is an **admin**.

1. Click on the user you just created to view their profile.
2. Scroll down to the section called **"Metadata"**.
3. Look for the **"Public Metadata"** box.
4. Click **Edit**.
5. Paste this **exact JSON**:
   ```json
   {
     "role": "admin"
   }
   ```
6. Click **Save**.

---

## Part 4: Test It Out 🚀

1. Go to your local app: [http://localhost:3000](http://localhost:3000)
2. Go to the **Sign In** page.
3. Sign in with the account you just created.
4. Once logged in, look at the sidebar. You should see a **Users** section.
5. Click **User Management**.
   - *If you see the table list of users*: **SUCCESS!** 🎉
   - *If you get redirected to dashboard*: Check the metadata in step 3 again.

## Part 5: How to Add More Users (The Easy Way)

Now that you are logged in as an Admin, you never need to use the Clerk Dashboard again for this!

1. Go to **Dashboard** > **Users** > **User Management** in your app.
2. Click the **"Add User"** button.
3. Type their email, name, and select **"Admin"** or **"User"**.
4. Click **Create**.
5. They will get an email invite automatically!
