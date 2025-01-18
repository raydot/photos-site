import { PrismaClient, Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { v2 as cloudinary } from "cloudinary"
import { ObjectId } from "mongodb"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token) {
      console.log("No token found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (token.role !== "uploader") {
      console.log("Invalid role:", token.role)
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    // Ensure the userId is a valid ObjectID
    const userId = new ObjectId(token.id)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Add file type validation
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Add file size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "photos",
      transformation: [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto" },
      ],
    })

    const thumbnail = await cloudinary.uploader.upload(dataURI, {
      folder: "thumbnails",
      transformation: [
        { width: 300, height: 300, crop: "fill" },
        { quality: "auto" },
      ],
    })

    const photoData: Prisma.PhotoUncheckedCreateInput = {
      url: result.secure_url,
      thumbnail: thumbnail.secure_url,
      userId: userId.toString(),
    }

    const photo = await prisma.photo.create({
      data: photoData,
    })

    return NextResponse.json(photo)
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ error: "Upload failed, man" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)

    // Match all parameters used by the widget
    const params = {
      timestamp,
      folder: "photos",
      source: "uw"
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET || ""
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    })
  } catch (error) {
    console.error("Upload signature error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    )
  }
}
