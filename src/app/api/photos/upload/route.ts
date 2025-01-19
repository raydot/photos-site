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

// Christmas-themed word lists
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

function generateFriendlyName(): string {
  const randomWord = (array: string[]) => array[Math.floor(Math.random() * array.length)]
  return `${randomWord(adjectives)}-${randomWord(nouns)}-${randomWord(actions)}`
}

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

    const friendlyName = generateFriendlyName()

    // Get upload signature from GET endpoint
    const response = await fetch("/api/photos/upload", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error("Failed to get upload signature:", response.status)
      return NextResponse.json({ error: "Failed to get upload signature" }, { status: 500 })
    }

    const uploadParams = await response.json()

    // Upload to Cloudinary using signed upload
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${uploadParams.cloudName}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `file=${file}&signature=${uploadParams.signature}&timestamp=${uploadParams.timestamp}&api_key=${uploadParams.apiKey}`,
    })

    if (!uploadResponse.ok) {
      console.error("Failed to upload photo:", uploadResponse.status)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    const uploadResult = await uploadResponse.json()

    const photoData: Prisma.PhotoUncheckedCreateInput = {
      url: uploadResult.secure_url,
      thumbnail: uploadResult.secure_url,
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
    const friendlyName = generateFriendlyName()

    // Include friendly name in the upload parameters
    const params = {
      timestamp,
      folder: "photos",
      context: `friendly_name=${friendlyName}`, // Store friendly name in metadata
      public_id: friendlyName // Use friendly name as the file name
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      ...params,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    )
  }
}
