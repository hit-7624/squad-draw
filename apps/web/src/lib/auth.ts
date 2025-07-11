import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "@repo/db/nextjs";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"

    }),
    emailAndPassword: {
        enabled: true,
        redirectTo: "/dashboard"
    }
});