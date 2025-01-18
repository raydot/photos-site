"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Photo {
  id: string
  url: string
  thumbnail: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      async function fetchPhotos() {
        try {
          const response = await fetch("/api/photos")
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch")
          }

          const data = await response.json()
          setPhotos(data)
        } catch (error) {
          if (error instanceof Error) {
            console.warn("Error fetching photos:", error.message)
          }
        } finally {
          setLoading(false)
        }
      }

      fetchPhotos()
    }
  }, [status, router])

  const handleDownload = async (photoUrl: string) => {
    try {
      const response = await fetch(photoUrl)
      if (!response.ok) {
        throw new Error("Download failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Extract filename from URL
      const filename = photoUrl.split("/").pop() || "photo.jpg"
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      // Log error details for debugging in production
      if (error instanceof Error) {
        console.warn("Download error:", error.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <Image
              src={photo.thumbnail}
              alt="Gallery image"
              width={300}
              height={300}
              className="rounded-lg object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={() => handleDownload(photo.url)}
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
      {photos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos uploaded yet.</p>
        </div>
      )}
    </div>
  )
}
