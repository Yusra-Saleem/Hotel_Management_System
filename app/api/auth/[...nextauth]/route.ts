import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

import GoogleProvider from "next-auth/providers/google";

// ... (rest of the imports)

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // Account lockout logic
        if (user.failedLoginAttempts >= 5) {
            if (user.lastFailedLoginAttempt && new Date().getTime() - user.lastFailedLoginAttempt.getTime() < 15 * 60 * 1000) { // 15 minutes
                throw new Error("Account locked due to too many failed login attempts. Please try again in 15 minutes.");
            } else {
                // Reset attempts after 15 minutes
                await prisma.user.update({
                    where: { id: user.id },
                    data: { failedLoginAttempts: 0, lastFailedLoginAttempt: null },
                });
            }
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash || "");

        if (!passwordMatch) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: { increment: 1 },
                    lastFailedLoginAttempt: new Date(),
                },
            });
          return null;
        }

        // Reset failed login attempts on successful login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lastFailedLoginAttempt: null,
                lastLoginAt: new Date(),
            },
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
        if (session.user) {
            session.user.role = token.role;
            session.user.id = token.id;
        }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };