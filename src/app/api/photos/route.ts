import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const photos = await prisma.photo.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        url: true,
        thumbnail: true,
      },
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
