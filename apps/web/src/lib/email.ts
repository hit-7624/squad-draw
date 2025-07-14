import nodemailer from "nodemailer";

// Create nodemailer transporter for Gmail
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email verification template
export const getVerificationEmailTemplate = (
  verificationUrl: string,
  userName?: string,
) => {
  return {
    subject: "Verify Your Email Address - Squad Draw",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email Address - Squad Draw</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  background-color: #f8f9fa;
              }
              .container {
                  background-color: white;
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .logo {
                  font-size: 32px;
                  font-weight: bold;
                  color: #d97757;
                  margin-bottom: 8px;
              }
              .subtitle {
                  color: #d97757;
                  font-size: 16px;
                  font-weight: 500;
              }
              .title {
                  font-size: 24px;
                  font-weight: 600;
                  color: #333;
                  text-align: center;
                  margin: 40px 0 30px 0;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 20px;
              }
              .message {
                  font-size: 16px;
                  color: #333;
                  line-height: 1.7;
                  margin-bottom: 40px;
              }
              .button-container {
                  text-align: center;
                  margin: 40px 0;
              }
              .verify-button {
                  display: inline-block;
                  background-color: #d97757;
                  color: white;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 16px;
                  font-weight: 600;
                  transition: background-color 0.3s ease;
              }
              .verify-button:hover {
                  background-color: #c86a4f;
              }
              .alternative-section {
                  margin-top: 50px;
                  padding-top: 30px;
                  border-top: 1px solid #e5e7eb;
              }
              .alternative-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                  margin-bottom: 15px;
              }
              .alternative-text {
                  font-size: 14px;
                  color: #333;
                  margin-bottom: 15px;
              }
              .verification-link {
                  word-break: break-all;
                  color: #2563eb;
                  text-decoration: none;
                  font-size: 14px;
                  padding: 12px;
                  background-color: #f3f4f6;
                  border-radius: 6px;
                  display: block;
                  margin-top: 10px;
              }
              .verification-link:hover {
                  color: #1d4ed8;
              }
              .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  color: #333;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">Squad Draw</div>
                  <div class="subtitle">Collaborative Drawing Platform</div>
              </div>
              
              <div class="title">Verify Your Email Address</div>
              
              <div class="greeting">Hi${userName ? ` ${userName}` : ""},</div>
              
              <div class="message">
                  Welcome to Squad Draw! We're excited to have you join our collaborative drawing community. To complete your registration and start creating amazing artwork with your team, please verify your email address.
              </div>
              
              <div class="button-container">
                  <a href="${verificationUrl}" class="verify-button" style="color: white;">✓ Verify Email Address</a>
              </div>
              
              <div class="alternative-section">
                  <div class="alternative-title">Alternative method:</div>
                  <div class="alternative-text">
                      If the button doesn't work, copy and paste this link into your browser:
                  </div>
                  <a href="${verificationUrl}" class="verification-link">
                      ${verificationUrl}
                  </a>
              </div>
              
              <div class="footer">
                  <p>This email was sent to verify your Squad Draw account. If you didn't create an account, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>
    `,
    text: `
      Hi${userName ? ` ${userName}` : ""},
      
      Thanks for signing up for Squad Draw! To complete your registration, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with Squad Draw, you can safely ignore this email.
      
      Best regards,
      The Squad Draw Team
    `,
  };
};

// Password reset email template
export const getPasswordResetEmailTemplate = (
  resetUrl: string,
  userName?: string,
) => {
  return {
    subject: "Reset Your Password - Squad Draw",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Squad Draw</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  background-color: #f8f9fa;
              }
              .container {
                  background-color: white;
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .logo {
                  font-size: 32px;
                  font-weight: bold;
                  color: #d97757;
                  margin-bottom: 8px;
              }
              .subtitle {
                  color: #d97757;
                  font-size: 16px;
                  font-weight: 500;
              }
              .title {
                  font-size: 24px;
                  font-weight: 600;
                  color: #333;
                  text-align: center;
                  margin: 40px 0 30px 0;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 20px;
              }
              .message {
                  font-size: 16px;
                  color: #333;
                  line-height: 1.7;
                  margin-bottom: 40px;
              }
              .button-container {
                  text-align: center;
                  margin: 40px 0;
              }
              .reset-button {
                  display: inline-block;
                  background-color: #d97757;
                  color: white;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 16px;
                  font-weight: 600;
                  transition: background-color 0.3s ease;
              }
              .reset-button:hover {
                  background-color: #c86a4f;
              }
              .alternative-section {
                  margin-top: 50px;
                  padding-top: 30px;
                  border-top: 1px solid #e5e7eb;
              }
              .alternative-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                  margin-bottom: 15px;
              }
              .alternative-text {
                  font-size: 14px;
                  color: #333;
                  margin-bottom: 15px;
              }
              .reset-link {
                  word-break: break-all;
                  color: #2563eb;
                  text-decoration: none;
                  font-size: 14px;
                  padding: 12px;
                  background-color: #f3f4f6;
                  border-radius: 6px;
                  display: block;
                  margin-top: 10px;
              }
              .reset-link:hover {
                  color: #1d4ed8;
              }
              .security-notice {
                  background-color: #fef3cd;
                  border: 1px solid #fceeba;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
              }
              .security-notice h4 {
                  color: #856404;
                  margin: 0 0 10px 0;
                  font-size: 16px;
                  font-weight: 600;
              }
              .security-notice p {
                  color: #856404;
                  margin: 0;
                  font-size: 14px;
              }
              .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  color: #333;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">Squad Draw</div>
                  <div class="subtitle">Collaborative Drawing Platform</div>
              </div>
              
              <div class="title">🔐 Reset Your Password</div>
              
              <div class="greeting">Hi${userName ? ` ${userName}` : ""},</div>
              
              <div class="message">
                  We received a request to reset your password for your Squad Draw account. Click the button below to create a new password.
              </div>
              
              <div class="button-container">
                  <a href="${resetUrl}" class="reset-button" style="color: white;">🔑 Reset Password</a>
              </div>

              <div class="security-notice">
                  <h4>🛡️ Security Notice</h4>
                  <p>This password reset link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
              </div>
              
              <div class="alternative-section">
                  <div class="alternative-title">Alternative method:</div>
                  <div class="alternative-text">
                      If the button doesn't work, copy and paste this link into your browser:
                  </div>
                  <a href="${resetUrl}" class="reset-link">
                      ${resetUrl}
                  </a>
              </div>
              
              <div class="footer">
                  <p>This email was sent because a password reset was requested for your Squad Draw account. If you didn't request this, please ignore this email.</p>
                  <p style="margin-top: 15px;">Need help? Contact our support team.</p>
              </div>
          </div>
      </body>
      </html>
    `,
    text: `
      Hi${userName ? ` ${userName}` : ""},
      
      We received a request to reset your password for your Squad Draw account.
      
      To reset your password, please visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour for your security.
      
      If you didn't request this password reset, you can safely ignore this email and your password will remain unchanged.
      
      Best regards,
      The Squad Draw Team
    `,
  };
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  userName?: string,
) => {
  try {
    // Validate inputs
    if (!email || !resetUrl) {
      throw new Error("Email and reset URL are required");
    }

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.EMAIL_FROM
    ) {
      throw new Error(
        "Email configuration missing. Please check EMAIL_USER, EMAIL_PASS, and EMAIL_FROM environment variables.",
      );
    }

    const transporter = createEmailTransporter();
    const emailTemplate = getPasswordResetEmailTemplate(resetUrl, userName);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    console.log(`📤 Attempting to send password reset email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Password reset email sent successfully:", {
      messageId: result.messageId,
      to: email,
      response: result.response,
    });

    return {
      success: true,
      messageId: result.messageId,
      recipient: email,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Log detailed error information
    console.error("❌ Failed to send password reset email:", {
      error: errorMessage,
      email: email,
      timestamp: new Date().toISOString(),
    });

    // Return detailed error information
    return {
      success: false,
      error: errorMessage,
      recipient: email,
      timestamp: new Date().toISOString(),
    };
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  verificationUrl: string,
  userName?: string,
) => {
  try {
    // Validate inputs
    if (!email || !verificationUrl) {
      throw new Error("Email and verification URL are required");
    }

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.EMAIL_FROM
    ) {
      throw new Error(
        "Email configuration missing. Please check EMAIL_USER, EMAIL_PASS, and EMAIL_FROM environment variables.",
      );
    }

    const transporter = createEmailTransporter();
    const emailTemplate = getVerificationEmailTemplate(
      verificationUrl,
      userName,
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    console.log(`📤 Attempting to send email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Verification email sent successfully:", {
      messageId: result.messageId,
      to: email,
      response: result.response,
    });

    return {
      success: true,
      messageId: result.messageId,
      recipient: email,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Log detailed error information
    console.error("❌ Failed to send verification email:", {
      error: errorMessage,
      email: email,
      timestamp: new Date().toISOString(),
    });

    // Return detailed error information
    return {
      success: false,
      error: errorMessage,
      recipient: email,
      timestamp: new Date().toISOString(),
    };
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email credentials not configured. Please check EMAIL_USER and EMAIL_PASS environment variables.",
      );
    }

    console.log("🔧 Testing email server connection...");
    const transporter = createEmailTransporter();

    // Verify the connection
    await transporter.verify();

    console.log("✅ Email server connection verified successfully");
    console.log(`📧 Connected as: ${process.env.EMAIL_USER}`);

    return {
      success: true,
      message: "Email server connection verified",
      emailUser: process.env.EMAIL_USER,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("❌ Email server connection failed:", {
      error: errorMessage,
      emailUser: process.env.EMAIL_USER,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: errorMessage,
      emailUser: process.env.EMAIL_USER,
    };
  }
};
