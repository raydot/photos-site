import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role?: "visitor" | "admin"
    } & DefaultSession["user"]
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.password || !credentials?.role) return null

        console.log("Authorizing credentials:", { role: credentials.role })

        if (
          credentials.role === "visitor" &&
          credentials.password === process.env.VISITOR_PASSWORD
        ) {
          return { id: "1", name: "Visitor", role: "visitor" }
        }

        if (
          credentials.role === "admin" &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "2", name: "Admin", role: "admin" }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: { id: string; name: string; role: "visitor" | "admin" } | null }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as "visitor" | "admin"
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  // debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
