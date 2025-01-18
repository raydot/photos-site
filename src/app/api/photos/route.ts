import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { resources } = await cloudinary.search
      .expression("folder:photos")
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute()

    const photos = resources.map((resource: any) => ({
      id: resource.public_id.split("/").pop(),
      url: resource.secure_url,
      thumbnail: cloudinary.url(resource.public_id, {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "jpg"
      })
    }))

    return Response.json(photos)
  } catch (error) {
    if (error instanceof Error) {
      console.warn("Photos API error:", error.message)
    }
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
