"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Photo {
  id: string
  url: string
  thumbnail: string
  friendlyName: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    fetchPhotos()
  }, [session, router])

  const fetchPhotos = async () => {
    try {
      console.log("Fetching photos...")
      const response = await fetch("/api/photos", {
        credentials: "include",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to fetch photos: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      console.log(`Fetched ${data.length} photos`)
      setPhotos(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load photos"
      console.error("Fetch error:", error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getFriendlyName = (id: string) => {
    const adjectives = [
      "merry", "jolly", "festive", "snowy", "sparkly", "happy", "cozy", "frosty",
      "glowing", "twinkling", "magical", "cheerful", "bright", "joyful", "peaceful"
    ]
    const nouns = [
      "dasher", "dancer", "prancer", "vixen", "comet", "cupid", "donner", "blitzen",
      "rudolph", "santa", "elf", "star", "gift", "dreidel", "latke", "menorah", 
      "gelt", "candle", "bell", "tree", "wreath"
    ]
    const actions = [
      "dancer", "singer", "giver", "sharer", "glider", "flier", "smiler",
      "laugher", "player", "celebrator", "decorator", "sparkler", "twinkler"
    ]

    // Use the ID to deterministically select words
    const hash = id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    const getWord = (array: string[], offset: number = 0) => {
      const index = Math.abs(hash + offset) % array.length
      return array[index]
    }

    return `${getWord(adjectives)}-${getWord(nouns, 1)}-${getWord(actions, 2)}`
  }

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${getFriendlyName(id)}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download photo')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">Loading photos...</div>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                <Image
                  src={photo.thumbnail}
                  alt=""
                  width={300}
                  height={300}
                  className="object-cover"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={photo.thumbnail}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-2">
                    <a
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="View full size"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDownload(photo.url, photo.id)}
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title={`Download ${getFriendlyName(photo.id)}`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
