import { NextRequest, NextResponse } from "next/server"
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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { resources } = await cloudinary.search
      .expression('folder:photos')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute()

    const photos = resources.map((resource: any) => ({
      id: resource.public_id.split('/').pop(),
      url: resource.secure_url,
      thumbnail: cloudinary.url(resource.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg'
      })
    }))

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Photos API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
