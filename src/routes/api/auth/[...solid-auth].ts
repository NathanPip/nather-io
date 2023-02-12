import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { serverEnv } from "~/env/server";
import { prisma } from "~/server/db/client";
import GitHub from "@auth/core/providers/github";
import type { Adapter } from "@auth/core/adapters";

export const authOpts: SolidAuthConfig = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || "user";
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // @ts-expect-error Types Issue
    GitHub({
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "user"
        };
      },
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
    }),
  ],
  debug: false,
};

export const { GET, POST } = SolidAuth(authOpts);
