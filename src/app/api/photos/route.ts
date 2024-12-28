import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const photosDir = path.join(process.cwd(), "public", "photos", "originals")
    const files = fs
      .readdirSync(photosDir)
      .filter((file) => file.match(/^\d{4}-\d{2}-\d{2}_\d{6}_\d{3}\.jpg$/))
      .sort((a, b) => b.localeCompare(a))

    const photos = files.map((file) => ({
      id: file.replace(".jpg", ""),
      url: `/photos/originals/${file}`,
      thumbnail: `/photos/thumbnails/${file}`,
    }))

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Photos API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
