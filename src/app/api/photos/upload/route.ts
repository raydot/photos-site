import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    console.log("Upload attempt - Session:", session)

    if (!session?.user) {
      console.log("No session found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (session.user.role !== "uploader") {
      console.log("Invalid role:", session.user.role)
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

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

    const photo = await prisma.photo.create({
      data: {
        url: result.secure_url,
        thumbnail: thumbnail.secure_url,
        userId: session.user.id,
      },
    })

    return NextResponse.json(photo)
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ error: "Upload failed, man" }, { status: 500 })
  }
}
