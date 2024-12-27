import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()
    const token = await getToken({ req: request })

    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    const response = await fetch(photo.url)

    if (!response.ok) {
      throw new Error("Failed to fetch photo")
    }

    const blob = await response.blob()
    const headers = new Headers()
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "image/jpeg"
    )
    headers.set(
      "Content-Disposition",
      `attachment; filename="photo-${photo.id}.jpg"`
    )

    return new NextResponse(blob, { headers })
  } catch (error) {
    console.error("Error downloading photo:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
