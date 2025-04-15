import nodemailer from "nodemailer";

// Create a transporter object
const createTransporter = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    // In development, we can use a test account or log to console
    console.log("Using development email configuration");

    // Option 1: Use Ethereal for testing (uncomment to use)
    // return nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: 'ethereal-test-account@ethereal.email', // replace with actual ethereal credentials
    //     pass: 'ethereal-password',
    //   },
    // });

    // Option 2: Just log emails to console
    return {
      sendMail: (mailOptions: any) => {
        console.log("Email would be sent in production:");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("Verification URL included in email");
        return Promise.resolve({ messageId: "test-message-id" });
      },
    } as nodemailer.Transporter;
  }

  // In production, use the configured email service
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

const transporter = createTransporter();

// Email verification template
export const sendVerificationEmail = async (
  email: string,
  token: string,
  username: string
) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to ${
          process.env.NEXT_PUBLIC_APP_NAME || "Our App"
        }!</h2>
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
        <p>Thanks,<br>The Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};

// Generate a random token
export const generateVerificationToken = (): string => {
  return Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join("");
};
