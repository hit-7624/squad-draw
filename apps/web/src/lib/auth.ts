import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db/nextjs";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    rateLimit: {
        enabled: true,
        window: Number(process.env.RATE_LIMIT_WINDOW),
        max: Number(process.env.RATE_LIMIT_MAX),
        customRules: {
            "/send-verification-email": {
                window: Number(process.env.VERIFICATION_EMAIL_RATE_LIMIT_WINDOW),
                max: Number(process.env.VERIFICATION_EMAIL_RATE_LIMIT_MAX),
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            try {
                console.log(`🔐 Sending password reset email to: ${user.email}`);
                const result = await sendPasswordResetEmail(user.email, url, user.name);

                if (!result.success) {
                    console.error('❌ Failed to send password reset email:', result.error);
                    return;
                }
                
                console.log(`✅ Password reset email sent successfully to: ${user.email}`);
            } catch (error) {
                console.error('❌ Critical error in password reset email:', error);
                return;
            }
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            try {
                console.log(`📧 Sending verification email to: ${user.email}`);
                const result = await sendVerificationEmail(user.email, url, user.name);

                if (!result.success) {
                    console.error('❌ Failed to send verification email:', result.error);
                    return;
                }
                
                console.log(`✅ Verification email sent successfully to: ${user.email}`);
            } catch (error) {
                console.error('❌ Critical error in email verification:', error);
                return;
            }
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    await prisma.session.deleteMany({
                        where: {
                            userId: session.userId
                        }
                    });
                    
                    console.log(`🗑️ Removed all existing sessions for user: ${session.userId}`);
                    return { data: session };
                }
            }
        }
    },
    trustedOrigins: [process.env.NEXT_PUBLIC_BASE_URL as string],
});