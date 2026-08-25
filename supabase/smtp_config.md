# CodeVault – Supabase Custom SMTP & Email Template Configuration

To send all OTP registration and password reset emails directly from **`code.v4ult@gmail.com`**, configure Supabase Auth as follows:

---

## 1. Enable Custom SMTP in Supabase

1. Open your **Supabase Dashboard** &rarr; Select your project.
2. Navigate to **Authentication** &rarr; **Settings** &rarr; **SMTP Settings**.
3. Toggle **"Enable Custom SMTP"** to `ON`.
4. Enter the SMTP credentials:
   - **Sender Email**: `code.v4ult@gmail.com`
   - **Sender Name**: `CodeVault – Coders Space`
   - **Host**: `smtp.gmail.com`
   - **Port**: `587` (or `465` with SSL)
   - **User**: `code.v4ult@gmail.com`
   - **Password**: *(Your Gmail 16-character App Password generated via Google Account Security &rarr; 2-Step Verification &rarr; App Passwords)*

---

## 2. Confirmation & OTP Email Template

In Supabase Dashboard &rarr; **Authentication** &rarr; **Email Templates** &rarr; **Confirm signup**:

- **Subject**: `Verify your CodeVault account`
- **Body**:
```html
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #FFFDF8; border: 1px solid #EFE6D5; border-radius: 18px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #1A202C; font-size: 24px; font-weight: 800; margin: 0;">CodeVault <span style="color: #E9B949;">– Coders Space</span></h1>
    <p style="color: #718096; font-size: 13px; margin-top: 4px;">Your Personal DSA Learning Workspace</p>
  </div>

  <div style="background-color: #FFF9EE; border: 1px solid #F8E0B0; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 20px;">
    <p style="color: #2D3748; font-size: 14px; margin: 0 0 12px 0;">Welcome to CodeVault! Please use the following 6-digit verification code to complete your registration:</p>
    <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #8C5D0B; background-color: #FFFFFF; border: 1px solid #EFE6D5; padding: 12px 20px; border-radius: 12px; display: inline-block;">
      {{ .Token }}
    </div>
    <p style="color: #A0AEC0; font-size: 12px; margin: 12px 0 0 0;">This OTP is valid for 10 minutes. Do NOT share this code with anyone.</p>
  </div>

  <p style="color: #718096; font-size: 12px; text-align: center; margin: 0;">
    If you did not request this verification, please safely disregard this email.<br>&copy; 2026 CodeVault – Coders Space.
  </p>
</div>
```

---

## 3. Password Reset Email Template

In Supabase Dashboard &rarr; **Authentication** &rarr; **Email Templates** &rarr; **Reset Password**:

- **Subject**: `Reset your CodeVault password`
- **Body**: Same clean educational theme with `{{ .ConfirmationURL }}` or `{{ .Token }}`.
