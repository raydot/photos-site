import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: "visitor" | "uploader"
  }

  interface Session {
    user: {
      id: string
      role?: "visitor" | "uploader"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "visitor" | "uploader"
  }
}
