import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Photo Gallery",
  description: "Secure photo sharing application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
