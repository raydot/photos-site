"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

declare global {
  interface Window {
    cloudinary: any
  }
}

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not admin
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    router.push("/login")
    return null
  }

  useEffect(() => {
    // Load Cloudinary Upload Widget script
    const script = document.createElement("script")
    script.src = "https://upload-widget.cloudinary.com/global/all.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleUpload = async () => {
    try {
      setError(null)
      setUploading(true)

      // Open Cloudinary Upload Widget
      window.cloudinary.openUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: "photos_unsigned",
          folder: "photos",
          sources: ["local", "url", "camera"],
          multiple: true,
          maxFiles: 10,
          cropping: false,
          showSkipCropButton: false,
          showPoweredBy: false,
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Upload error:", error)
            setError("Failed to upload photos")
          } else if (result.event === "success") {
            // Refresh the gallery page
            router.push("/gallery")
            router.refresh()
          }
          setUploading(false)
        }
      )
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Upload failed")
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Upload Photos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload photos to the gallery
          </p>
          <Link 
            href="/gallery" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View Gallery →
          </Link>
        </div>

        <div className="mt-8">
          {error && (
            <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? "Opening upload widget..." : "Choose Photos"}
          </button>
        </div>
      </div>
    </div>
  )
}
