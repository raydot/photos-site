import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    const response = await fetch(photo.url)
    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="photo-${photo.id}.jpg"`,
      },
    })
  } catch (error) {
    console.error("Error downloading photo:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
