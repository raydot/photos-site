"use client"
import { useEffect, useState } from "react"

export function TestHydration() {
  const [mounted, setMounted] = useState(false)

  console.log("TestHydration rendering:", { mounted })

  useEffect(() => {
    console.log("TestHydration mounting")
    setMounted(true)
  }, [])

  return <div data-mounted={mounted}>Test Component</div>
}
