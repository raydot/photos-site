import type { DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: "visitor" | "uploader"
  }

  interface JWT {
    id: string
    role: "visitor" | "uploader"
  }
}
