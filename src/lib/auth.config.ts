import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      // Public routes
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/sites/") ||
        pathname.startsWith("/imported/") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/uploads") ||
        pathname === "/favicon.ico" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml"
      ) {
        return true;
      }

      // Redirect unauthenticated users to login
      if (!isLoggedIn) {
        return false; // NextAuth redirects to signIn page
      }

      // Admin routes — only ADMIN role
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Client dashboard routes — only CLIENT role (or ADMIN)
      if (
        pathname.startsWith("/dashboard") &&
        role !== "CLIENT" &&
        role !== "ADMIN"
      ) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
