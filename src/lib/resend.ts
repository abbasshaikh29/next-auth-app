import { Resend } from "resend";

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email verification template
export const sendVerificationEmail = async (
  email: string,
  token: string,
  username: string
) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "TheTribeLab";

  // Check if Resend is properly initialized
  if (!resend) {
    console.error("Resend API key is not configured");
    return {
      success: false,
      error: new Error("Resend API key is not configured"),
      errorMessage: "Email service is not configured",
      errorCode: "MISSING_API_KEY",
    };
  }

  try {
    // In development mode, log the verification URL
    if (process.env.NODE_ENV === "development") {
      console.log("Verification URL (dev mode):", verificationUrl);

      // Auto-verify in development if configured
      if (process.env.AUTO_VERIFY_EMAIL === "true") {
        console.log("Auto-verify is enabled in development mode");
        return {
          success: true,
          messageId: "dev-auto-verify-mode",
          devMode: true,
        };
      }
    }

    // In development mode with no verified domain, we can only send to the account owner's email
    // So we'll just log the email content and auto-verify in development
    if (process.env.NODE_ENV === "development") {
      console.log(`
        ========== DEVELOPMENT MODE: EMAIL PREVIEW ==========
        From: ${process.env.EMAIL_FROM}
        To: ${email}
        Subject: Verify Your Email Address for ${appName}
        Verification URL: ${verificationUrl}

        This email would be sent in production mode with a verified domain.
        ====================================================
      `);

      // Return success for development mode
      return {
        success: true,
        messageId: "dev-mode-email-preview",
        devMode: true,
      };
    }

    // Send email using Resend (for production or if we have a verified domain)
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM?.includes("resend.dev")
        ? process.env.EMAIL_FROM // Use as-is for shared domain
        : `${appName} <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
      to: email,
      subject: `Verify Your Email Address for ${appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to ${appName}!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Thanks,<br>The ${appName} Team</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `
        Welcome to ${appName}!

        Hi ${username},

        Thank you for registering. Please verify your email address by visiting the link below:

        ${verificationUrl}

        This link will expire in 24 hours.

        If you did not create an account, please ignore this email.

        Thanks,
        The ${appName} Team
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      return {
        success: false,
        error: error.message || "An unknown error occurred",
        errorMessage: error.message || "An unknown error occurred",
        errorCode: (error as any).statusCode || "UNKNOWN",
        messageId: data?.id,
        recipient: email,
        emailType: "verification",
      };
    }

    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error("Exception sending verification email:", error);

    // Provide more specific error information
    let errorMessage =
      "Failed to send verification email: " +
      (error.message || "Unknown error");
    let errorCode = error.code || "UNKNOWN";

    return {
      success: false,
      error,
      errorMessage,
      errorCode,
    };
  }
};

// Generate a random token
export const generateVerificationToken = (): string => {
  return Array(32)
    .fill(null)
    .map(() => ((Math.random() * 16) | 0).toString(16))
    .join("");
};
