import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const allowedEmail = process.env.ALLOWED_EMAIL || '';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      checks: ["none"], // Disable state check - for proxy/tunnel environments
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email === allowedEmail) {
        return true;
      }
      return false;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: false,
});

export { handler as GET, handler as POST };
