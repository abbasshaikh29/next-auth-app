import nodemailer from "nodemailer";

// Create a transporter object
const createTransporter = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("Using development email configuration");

    // Check if Ethereal credentials are provided
    if (
      process.env.EMAIL_SERVER_HOST === "smtp.ethereal.email" &&
      process.env.EMAIL_SERVER_USER &&
      process.env.EMAIL_SERVER_PASSWORD
    ) {
      console.log("Using Ethereal Email for testing");
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        secure: process.env.EMAIL_SERVER_SECURE === "true",
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });
    }

    // Check if other email credentials are provided
    if (
      process.env.EMAIL_SERVER_HOST &&
      process.env.EMAIL_SERVER_USER &&
      process.env.EMAIL_SERVER_PASSWORD
    ) {
      console.log(
        `Using configured email provider: ${process.env.EMAIL_SERVER_HOST}`
      );
      return nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: process.env.EMAIL_SERVER_SECURE === "true",
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });
    }

    // Default: Just log emails to console
    console.log("No email credentials provided, logging to console instead");
    return {
      sendMail: (mailOptions: any) => {
        console.log("Email would be sent in production:");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("Verification URL included in email");
        console.log(
          "Content:",
          mailOptions.html ? "HTML Email" : mailOptions.text
        );
        return Promise.resolve({ messageId: "test-message-id" });
      },
    } as nodemailer.Transporter;
  }

  // In production, use the configured email service
  const transportConfig = {
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  };

  // Add provider-specific configurations
  if (process.env.EMAIL_SERVER_HOST?.includes("amazonaws.com")) {
    console.log("Using Amazon SES configuration");
    // SES requires TLS
    transportConfig.secure = true;
  }

  return nodemailer.createTransport(transportConfig);
};

const transporter = createTransporter();

// Email verification template
export const sendVerificationEmail = async (
  email: string,
  token: string,
  username: string
) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Our App";

  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", {
      messageId: info.messageId,
      recipient: email,
      emailType: "verification",
    });

    // If using Ethereal in development, log the preview URL
    if (
      process.env.NODE_ENV === "development" &&
      process.env.EMAIL_SERVER_HOST === "smtp.ethereal.email" &&
      info.messageId
    ) {
      console.log(
        "Ethereal email preview URL:",
        nodemailer.getTestMessageUrl(info)
      );
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);

    // Provide more specific error information
    let errorMessage = "Failed to send verification email";
    if (error instanceof Error && error.message) {
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage =
          "Could not connect to email server. Check your email configuration.";
      } else if (error.message.includes("ETIMEDOUT")) {
        errorMessage =
          "Connection to email server timed out. Check your network settings.";
      } else if (error instanceof Error && error.message.includes("EAUTH")) {
        errorMessage = "Email authentication failed. Check your credentials.";
      } else if (
        error instanceof Error &&
        error.message.includes("responseCode") &&
        parseInt(
          error.message.split(" ")[error.message.split(" ").length - 1]
        ) >= 500
      ) {
        errorMessage = "Email server error. Try again later.";
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorMessage,
      errorCode: "UNKNOWN",
    };
  }
};
