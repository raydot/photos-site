"use client"
import { useEffect } from "react"

export function DebugRender({ componentName }: { componentName: string }) {
  useEffect(() => {
    console.log(`${componentName} mounted`)
    return () => console.log(`${componentName} unmounted`)
  }, [componentName])

  console.log(`${componentName} rendering`)
  return null
}
