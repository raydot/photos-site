import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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

        if (
          credentials.role === "visitor" &&
          credentials.password === process.env.VISITOR_PASSWORD
        ) {
          return { id: "1", name: "Visitor", role: "visitor" }
        }

        if (
          credentials.role === "uploader" &&
          credentials.password === process.env.UPLOAD_PASSWORD
        ) {
          return { id: "2", name: "Uploader", role: "uploader" }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = user.role
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) session.user.role = token.role as "visitor" | "uploader"
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
})

export { handler as GET, handler as POST }
