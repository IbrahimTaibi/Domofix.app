import NextAuth, { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      authorization: {
        params: { scope: "public_profile,email" },
      },
      profile(profile: any) {
        const highRes = profile?.id
          ? `https://graph.facebook.com/${profile.id}/picture?type=large&height=1024&width=1024`
          : undefined;
        const image = highRes || profile?.picture?.data?.url;
        return {
          id: profile?.id,
          name: profile?.name,
          email: profile?.email,
          image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account) {
        token.provider = account.provider;
        (token as any).providerId = account.providerAccountId;
        try {
          const apiBase =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const fullName = (profile as any)?.name || "";
          const [firstName, ...rest] = fullName.split(" ");
          const lastName = rest.join(" ") || undefined;
          const avatarFromUser = (user as any)?.image as string | undefined;
          const avatarFromProfile = (profile as any)?.id
            ? `https://graph.facebook.com/${(profile as any).id}/picture?type=large&height=1024&width=1024`
            : (profile as any)?.picture?.data?.url;
          const avatar = avatarFromUser || avatarFromProfile;
          const res = await fetch(`${apiBase}/auth/oauth/${account.provider}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,
              email: (profile as any)?.email,
              firstName: firstName || (profile as any)?.first_name,
              lastName: lastName || (profile as any)?.last_name,
              avatar,
              providerId: account.providerAccountId,
              accessToken: (account as any)?.access_token,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            (token as any).backendAccessToken = data.access_token;
            (token as any).backendUser = data.user;
          }
        } catch (err) {
          // Ignore backend linking errors; NextAuth session still works
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).provider = (token as any).provider;
      (session as any).providerId = (token as any).providerId;
      (session as any).backendAccessToken = (token as any).backendAccessToken;
      (session as any).backendUser = (token as any).backendUser;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
