import type { NextAuthOptions } from "next-auth";
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
};