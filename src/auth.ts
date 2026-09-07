import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, auth } = NextAuth({
  providers: [Google, GitHub],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, user }) {
      return Boolean(account?.provider && account.providerAccountId) || Boolean(user.email);
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.provider =
          typeof token.provider === "string" ? token.provider : undefined;
        session.user.providerAccountId =
          typeof token.providerAccountId === "string"
            ? token.providerAccountId
            : undefined;
      }

      return session;
    },
  },
});
