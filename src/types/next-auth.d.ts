import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      provider?: string;
      providerAccountId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    providerAccountId?: string;
  }
}
