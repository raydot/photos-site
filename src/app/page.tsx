"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Home() {
  const router = useRouter()
  const { status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  console.log("Home rendering:", { status, mounted, isNavigating })

  useEffect(() => {
    console.log("Home mounted")
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === "authenticated" && !isNavigating) {
      console.log("Home initiating redirect to gallery")
      setIsNavigating(true)
      try {
        router.push("/gallery")
      } catch (error) {
        console.error("Navigation error:", error)
        setIsNavigating(false)
      }
    }
  }, [mounted, status, router, isNavigating])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
// "use client"
// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { useSession } from "next-auth/react"

// export default function Home() {
//   const router = useRouter()
//   const { status } = useSession()
//   const [mounted, setMounted] = useState(false)

//   console.log("Home rendering:", { status, mounted })

//   useEffect(() => {
//     console.log("Home mounted")
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     if (mounted && status === "authenticated") {
//       console.log("Home redirecting to gallery")
//       router.push("/gallery")
//     }
//   }, [mounted, status, router])

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//     </div>
//   )
// }

// // "use client"

// // import { useEffect, useState } from "react"
// // import { useRouter } from "next/navigation"

// // export default function Home() {
// //   const router = useRouter()
// //   const [isClient, setIsClient] = useState(false)

// //   useEffect(() => {
// //     setIsClient(true)
// //   }, [])

// //   useEffect(() => {
// //     if (isClient) {
// //       router.push("/gallery")
// //     }
// //   }, [isClient, router])

// //   return (
// //     <div className="flex items-center justify-center min-h-screen">
// //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// //     </div>
// //   )
// // }
