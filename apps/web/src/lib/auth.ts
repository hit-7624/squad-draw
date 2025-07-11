import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db/nextjs";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
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
    trustedOrigins: ["http://localhost:3000"],
});