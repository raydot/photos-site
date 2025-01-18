import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth first
    const token = await getToken({ req: request })
    if (!token || token.role !== "admin") {
      return Response.json({ error: "Not authorized" }, { status: 401 })
    }

    // Get the image ID from the URL
    const segments = request.url.split('/')
    const imageId = segments[segments.length - 1]
    
    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(imageId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return Response.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    )
  }
}
