import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: "visitor" | "uploader"
  }

  interface Session {
    user: {
      id: string
      role: "visitor" | "uploader"
    } & DefaultSession["user"]
  }

  interface JWT {
    id: string
    role: "visitor" | "uploader"
  }
}
