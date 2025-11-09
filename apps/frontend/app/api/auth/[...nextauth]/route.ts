import NextAuth, { NextAuthOptions } from "next-auth";
import { authOptions as baseAuthOptions } from "@/lib/auth";
import { httpRequest } from '@/shared/utils/http'

const authOptions: NextAuthOptions = {
  ...baseAuthOptions,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      // Helper to decode JWT exp
      const decodeExp = (jwt?: string): number | undefined => {
        if (!jwt) return undefined;
        try {
          const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString());
          return typeof payload?.exp === "number" ? payload.exp : undefined;
        } catch {
          return undefined;
        }
      };

      // On initial OAuth sign-in, link and store backend tokens
      if (account) {
        token.provider = account.provider;
        (token as any).providerId = account.providerAccountId;
        try {
          const fullName = (profile as any)?.name || "";
          const [firstName, ...rest] = fullName.split(" ");
          const lastName = rest.join(" ") || undefined;
          const avatarFromUser = (user as any)?.image as string | undefined;
          const avatarFromProfile = (profile as any)?.id
            ? `https://graph.facebook.com/${(profile as any).id}/picture?type=large&height=1024&width=1024`
            : (profile as any)?.picture?.data?.url;
          const avatar = avatarFromUser || avatarFromProfile;
          const data = await httpRequest<any>(`${apiBase}/auth/oauth/${account.provider}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            (token as any).backendAccessToken = data.access_token;
            (token as any).backendRefreshToken = data.refresh_token;
            (token as any).backendAccessTokenExp = decodeExp(data.access_token);
            (token as any).backendUser = data.user;
        } catch {
          // Ignore backend linking errors; NextAuth session still works
        }
      } else {
        // Subsequent calls: refresh backend access token if expired and we have refresh token
        const exp = (token as any).backendAccessTokenExp as number | undefined;
        const access = (token as any).backendAccessToken as string | undefined;
        const refresh = (token as any).backendRefreshToken as string | undefined;
        const now = Math.floor(Date.now() / 1000);
        const isExpired = exp ? now >= exp - 30 : false; // refresh 30s before expiry

        if (access && refresh && isExpired) {
          try {
            const data = await httpRequest<any>(`${apiBase}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: refresh }),
            });
              (token as any).backendAccessToken = data.access_token;
              (token as any).backendRefreshToken = data.refresh_token || refresh;
              (token as any).backendAccessTokenExp = decodeExp(data.access_token);
              (token as any).backendUser = data.user || (token as any).backendUser;
          } catch {
            // On refresh failure, keep existing token; client may prompt re-login
          }
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
