import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (
          creds?.email === process.env.APP_EMAIL &&
          creds?.password === process.env.APP_PASSWORD
        ) {
          return { id: "owner", email: String(creds.email) };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: { authorized: ({ auth }) => !!auth?.user },
});
