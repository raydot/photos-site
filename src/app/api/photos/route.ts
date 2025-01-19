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
      console.log("Authentication failed: No token found")
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Searching Cloudinary for photos...")
    const searchExpression = "folder:photos AND resource_type:image"
    console.log("Search expression:", searchExpression)
    const { resources } = await cloudinary.search
      .expression(searchExpression)
      .with_field("context")
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute()

    console.log(`Found ${resources.length} photos in the photos folder`)
    if (resources.length > 0) {
      const firstPhoto = resources[0]
      console.log("Example photo details:", {
        id: firstPhoto.public_id,
        url: firstPhoto.secure_url,
        format: firstPhoto.format,
        width: firstPhoto.width,
        height: firstPhoto.height
      })
    }

    const photos = resources.map((resource: any) => {
      const photo = {
        id: resource.public_id,
        url: resource.secure_url,
        thumbnail: cloudinary.url(resource.public_id, {
          width: 300,
          height: 300,
          crop: "fill",
          gravity: "auto",
          quality: "auto:eco",
          fetch_format: "auto",
          loading: "lazy"
        }),
        friendlyName: resource.context?.friendly_name || resource.public_id.split("/").pop()
      }
      console.log("Processed photo:", photo.id)
      return photo
    })

    console.log(`Successfully processed ${photos.length} photos`)

    return Response.json(photos)
  } catch (error) {
    console.error("Photos API error:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
